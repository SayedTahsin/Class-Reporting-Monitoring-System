import ClassHistoryTable from "@/components/class-history";
import { setUser } from "@/store/slices/userSlice";
import { authGuard } from "@/utils/auth-guard";
import { trpc } from "@/utils/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useDispatch } from "react-redux";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  beforeLoad: async () => {
    await authGuard();
  },
});

function HomeComponent() {
  // const dispatch = useDispatch()

  // const setUserStore = () => {
  //   const { data: user } = useQuery(trpc.user.getById.queryOptions())
  //   const { data: roleName } = useQuery(
  //     trpc.user.getUserRoleName.queryOptions()
  //   )
  //   console.log(roleName)
  //   if (user) {
  //     const u = user[0]
  //     dispatch(
  //       setUser({
  //         id: u.id ?? "",
  //         name: u.name ?? "",
  //         email: u.email ?? "",
  //         isLoggedIn: true,
  //         section: u.sectionId ?? "",
  //         role: u.roleId ?? "",
  //       })
  //     )
  //   }
  // }

  return <ClassHistoryTable userRoleName={"SuperAdmin"} />;
}
