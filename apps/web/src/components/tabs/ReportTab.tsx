import { Label } from "@/components/ui/label"
import { trpc } from "@/utils/trpc"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { Card, CardContent } from "../ui/card"
import { DatePickerWithRange } from "../ui/date-picker-range"

type ReportType = "teacher" | "course" | "section"

const ReportTab = () => {
  const [reportType, setReportType] = useState<ReportType>("teacher")
  const [selectedId, setSelectedId] = useState<string>("")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const {
    data: teachersResult = { data: [], total: 0, hasNext: false },
    isLoading: isTeachersLoading,
    error: teachersError,
  } = useQuery({
    ...trpc.user.getTeachers.queryOptions(),
  })
  const teachers = teachersResult.data || []

  const {
    data: courseResult = { data: [], total: 0, hasNext: false },
    isLoading: isCoursesLoading,
    error: coursesError,
  } = useQuery({
    ...trpc.course.getAll.queryOptions(),
  })
  const courses = courseResult.data || []

  const {
    data: sections,
    isLoading: isSectionsLoading,
    error: sectionsError,
  } = useQuery(trpc.section.getAll.queryOptions())
  const {
    data: slots = [],
    isLoading: isSlotsLoading,
    error: slotsError,
  } = useQuery(trpc.slot.getAll.queryOptions())

  const courseMap = Object.fromEntries(courses.map((c) => [c.id, c.title]))
  const sectionMap = Object.fromEntries(
    sections?.map((s) => [s.id, s.name]) || [],
  )
  const slotMap = Object.fromEntries(
    slots.map((slot) => [slot.id, `${slot.startTime} - ${slot.endTime}`]),
  )

  const from = dateRange?.from
    ? Math.floor(
        Date.UTC(
          dateRange.from.getFullYear(),
          dateRange.from.getMonth(),
          dateRange.from.getDate(),
          0,
          0,
          0,
          0,
        ) / 1000,
      ).toString()
    : undefined

  const to = dateRange?.to
    ? Math.floor(
        Date.UTC(
          dateRange.to.getFullYear(),
          dateRange.to.getMonth(),
          dateRange.to.getDate(),
          23,
          59,
          59,
          999,
        ) / 1000,
      ).toString()
    : undefined

  const {
    data: reportData = {
      list: [],
      deliveredCount: 0,
      notDeliveredCount: 0,
      rescheduledCount: 0,
    },
    isLoading: isReportLoading,
    error: reportError,
  } = useQuery({
    ...(() => {
      switch (reportType) {
        case "teacher":
          return trpc.classHistory.getByTeacherId.queryOptions({
            teacherId: selectedId,
            from,
            to,
          })
        case "course":
          return trpc.classHistory.getByCourseId.queryOptions({
            courseId: selectedId,
            from,
            to,
          })
        case "section":
          return trpc.classHistory.getBySectionId.queryOptions({
            sectionId: selectedId,
            from,
            to,
          })
        default:
          throw new Error("Invalid report type")
      }
    })(),
    enabled: !!selectedId,
  })

  const isLoadingData =
    isTeachersLoading || isCoursesLoading || isSectionsLoading || isSlotsLoading

  const dependencyError =
    teachersError || coursesError || sectionsError || slotsError

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="mb-4 flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="reportType"
              value="teacher"
              checked={reportType === "teacher"}
              onChange={() => {
                setReportType("teacher")
                setSelectedId("")
              }}
            />
            Teacher
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="reportType"
              value="course"
              checked={reportType === "course"}
              onChange={() => {
                setReportType("course")
                setSelectedId("")
              }}
            />
            Course
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="reportType"
              value="section"
              checked={reportType === "section"}
              onChange={() => {
                setReportType("section")
                setSelectedId("")
              }}
            />
            Section
          </label>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px] flex-1">
            <Label className="mb-1 block">
              Select {reportType.charAt(0).toUpperCase() + reportType.slice(1)}
            </Label>

            {isLoadingData ? (
              <p>Loading options...</p>
            ) : dependencyError ? (
              <p className="text-red-600">Failed to load options.</p>
            ) : reportType === "teacher" ? (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded border bg-background p-2 text-sm"
              >
                <option value="">Select teacher</option>
                {teachers?.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            ) : reportType === "course" ? (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded border bg-background p-2 text-sm"
              >
                <option value="">Select course</option>
                {courses?.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full rounded border bg-background p-2 text-sm"
              >
                <option value="">Select section</option>
                {sections?.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="min-w-[300px] flex-1">
            <Label className="mb-1 block">Select Date Range</Label>
            <DatePickerWithRange date={dateRange} onDateChange={setDateRange} />
          </div>
        </div>

        {isReportLoading && (
          <p className="py-6 text-center">Loading report...</p>
        )}
        {reportError && (
          <p className="py-6 text-center text-red-600">
            Error loading report: {reportError.message}
          </p>
        )}

        {!isReportLoading && !reportError && reportData.list.length > 0 && (
          <div className="mt-4 space-y-2">
            <Label className="text-lg">Summary Report</Label>
            <div className="flex gap-4 text-sm">
              {(() => {
                const {
                  deliveredCount,
                  notDeliveredCount,
                  rescheduledCount,
                  list,
                } = reportData
                const total = list.length || 1
                const getPercent = (count: number) =>
                  ((count / total) * 100).toFixed(1)

                return (
                  <>
                    <div className="text-green-600">
                      Delivered: {deliveredCount} ({getPercent(deliveredCount)}
                      %)
                    </div>
                    <div className="text-orange-500">
                      Not Delivered: {notDeliveredCount} (
                      {getPercent(notDeliveredCount)}%)
                    </div>
                    <div className="text-red-600">
                      Rescheduled: {rescheduledCount} (
                      {getPercent(rescheduledCount)}%)
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {!isReportLoading && !reportError && reportData.list.length > 0 && (
          <div className="mt-4 overflow-hidden rounded border">
            <div className="max-h-64 overflow-y-auto">
              <table className="min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Slot</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Course</th>
                    <th className="p-2 text-left">Section</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.list.map((entry, i) => (
                    <tr key={entry.id ?? i} className="border-t">
                      <td className="p-2">
                        {new Date(entry.date).toLocaleDateString()}
                      </td>
                      <td className="p-2">
                        {slotMap[entry.slotId] || entry.slotId}
                      </td>
                      <td className="p-2">{entry.status}</td>
                      <td className="p-2">
                        {courseMap[entry.courseId] || entry.courseId}
                      </td>
                      <td className="p-2">
                        {sectionMap[entry.sectionId] || entry.sectionId}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedId &&
          !isReportLoading &&
          !reportError &&
          reportData.list.length === 0 && (
            <p className="mt-6 text-center text-muted-foreground">
              No data found.
            </p>
          )}
      </CardContent>
    </Card>
  )
}

export default ReportTab
