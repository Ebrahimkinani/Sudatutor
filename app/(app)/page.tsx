import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/auth"
import { prisma } from "@/lib/db/prisma"
import { HomeContextForm } from "@/components/dashboard/HomeContextForm"
import { InfiniteGrid } from "@/components/ui/the-infinite-grid"
import { classRepo } from "@/app/api/admin/classes/class.repo"
import { subjectRepo } from "@/app/api/admin/subjects/subject.repo"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { selectedClass: true, selectedSubject: true }
  })

  // Fetch active classes and subjects from database
  const classes = await classRepo.findAllActive()
  const subjects = await subjectRepo.findAllActive()

  return (
    <InfiniteGrid className="pb-20">
      <div className="max-w-2xl w-full space-y-8 text-center">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-[#000000]">
            سودا توتور
          </h1>
          <p className="text-muted-foreground">
            معلمك الذكي للمناهج السودانية
          </p>
        </div>

        <HomeContextForm
          defaultClass={user?.selectedClass}
          defaultSubject={user?.selectedSubject}
          classes={classes}
          subjects={subjects}
        />
      </div>
    </InfiniteGrid>
  )
}

