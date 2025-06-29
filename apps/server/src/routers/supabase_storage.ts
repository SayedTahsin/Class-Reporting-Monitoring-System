import { supabase } from "@/lib/supabase-server"
import { protectedProcedure, router } from "@/lib/trpc"
import { z } from "zod"

export const supabaseRouter = router({
  uploadFile: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        type: z.string(),
        base64: z.string(),
        courseName: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { name, type, base64, courseName } = input
      const username = ctx.session.user.id
      const buffer = Buffer.from(base64.split(",")[1], "base64")

      const filePath = `${courseName}/user-${username}/${Date.now()}-${name}`

      const { error: uploadError } = await supabase.storage
        .from("pdf")
        .upload(filePath, buffer, {
          contentType: type,
        })

      if (uploadError) {
        throw new Error(`Upload failed: ${uploadError.message}`)
      }

      const { data, error: urlError } = await supabase.storage
        .from("pdf")
        .createSignedUrl(filePath, 60 * 60)

      if (urlError || !data?.signedUrl) {
        throw new Error("Failed to generate signed URL")
      }

      return {
        url: data.signedUrl,
        path: filePath,
        originalName: name,
      }
    }),

  listFiles: protectedProcedure.query(async ({ ctx }) => {
    const username = ctx.session.user.id

    const { data: folders, error: folderError } = await supabase.storage
      .from("pdf")
      .list("", { limit: 100 })

    if (folderError) {
      throw new Error(`Failed to list course folders: ${folderError.message}`)
    }

    const allFiles = await Promise.all(
      folders.map(async (folder) => {
        const courseName = folder.name
        const folderPath = `${courseName}/user-${username}`

        const { data: files, error } = await supabase.storage
          .from("pdf")
          .list(folderPath, {
            limit: 100,
            sortBy: { column: "created_at", order: "desc" },
          })

        if (error) return []

        return await Promise.all(
          files.map(async (file) => {
            const fullPath = `${folderPath}/${file.name}`
            const { data: signed, error: signedErr } = await supabase.storage
              .from("pdf")
              .createSignedUrl(fullPath, 3600)

            return {
              name: file.name,
              signedUrl: signed?.signedUrl ?? null,
              path: fullPath,
              course: courseName,
              createdAt: file.metadata?.created_at ?? null,
              size: file.metadata?.size ?? null,
              error: signedErr?.message ?? null,
            }
          }),
        )
      }),
    )

    return allFiles.flat()
  }),

  deleteFile: protectedProcedure
    .input(z.object({ path: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { path } = input
      const expectedPrefix = `user-${ctx.session.user.id}`

      // security check to ensure the user can only delete their own file
      if (!path.includes(expectedPrefix)) {
        throw new Error("You are not authorized to delete this file.")
      }

      const { error } = await supabase.storage.from("pdf").remove([path])

      if (error) {
        throw new Error(`Failed to delete file: ${error.message}`)
      }

      return { success: true }
    }),

  listAllResources: protectedProcedure
    .input(
      z.object({
        courseName: z.string().optional(),
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ input }) => {
      const { courseName, page, limit } = input

      // Step 1: List courses (filtered if needed)
      const { data: allCourses, error: courseError } = await supabase.storage
        .from("pdf")
        .list("", { limit: 100 })

      if (courseError)
        throw new Error(`Failed to list courses: ${courseError.message}`)

      const filteredCourses = courseName
        ? allCourses.filter((c) => c.name === courseName)
        : allCourses

      const files = []

      for (const course of filteredCourses) {
        const courseName = course.name

        // Step 2: Get user folders inside course
        const { data: userFolders, error: userError } = await supabase.storage
          .from("pdf")
          .list(courseName, { limit: 100 })

        if (userError) continue

        for (const userFolder of userFolders) {
          const userPath = `${courseName}/${userFolder.name}`

          const { data: userFiles, error: fileError } = await supabase.storage
            .from("pdf")
            .list(userPath, {
              limit: 100,
              sortBy: { column: "created_at", order: "desc" },
            })

          if (fileError) continue

          for (const file of userFiles) {
            const path = `${userPath}/${file.name}`

            const { data: signed, error: signedErr } = await supabase.storage
              .from("pdf")
              .createSignedUrl(path, 3600)

            files.push({
              course: courseName,
              uploadedBy: userFolder.name,
              name: file.name,
              path,
              signedUrl: signed?.signedUrl ?? null,
              createdAt: file.metadata?.created_at ?? null,
              size: file.metadata?.size ?? null,
              error: signedErr?.message ?? null,
            })
          }
        }
      }

      const start = (page - 1) * limit
      const paginated = files.slice(start, start + limit)

      return {
        data: paginated,
        total: files.length,
        page,
        totalPages: Math.ceil(files.length / limit),
      }
    }),
})
