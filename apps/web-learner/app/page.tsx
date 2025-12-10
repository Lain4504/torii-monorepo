// Client-side CRUD demo using generated GraphQL hooks
"use client"

import { FormEvent, useMemo, useState } from "react"

import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetCoursesQuery,
  useUpdateCourseMutation,
} from "@workspace/data-access"
import { Button } from "@workspace/ui/components/button"

type Draft = {
  id?: number
  title: string
  description?: string
  price: number
  published: boolean
}

const emptyDraft: Draft = {
  title: "",
  description: "",
  price: 0,
  published: false,
}

export default function Page() {
  const { data, loading, refetch } = useGetCoursesQuery()
  const [createCourse, { loading: creating }] = useCreateCourseMutation()
  const [updateCourse, { loading: updating }] = useUpdateCourseMutation()
  const [deleteCourse, { loading: deleting }] = useDeleteCourseMutation()

  const [draft, setDraft] = useState<Draft>(emptyDraft)

  const isEditing = useMemo(() => Boolean(draft.id), [draft.id])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const { id, ...input } = draft
    if (isEditing && draft.id) {
      await updateCourse({ variables: { id: draft.id, input } })
    } else {
      await createCourse({ variables: { input } })
    }
    setDraft(emptyDraft)
    refetch()
  }

  async function handleDelete(id: number) {
    await deleteCourse({ variables: { id } })
    if (draft.id === id) setDraft(emptyDraft)
    refetch()
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 space-y-8">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Learner (Next.js)</p>
        <h1 className="text-3xl font-semibold">Course CRUD demo</h1>
        <p className="text-sm text-muted-foreground">
          Đang gọi trực tiếp GraphQL gateway và dùng hooks sinh tự động.
        </p>
      </header>

      <section className="rounded-xl border bg-background p-6 shadow-sm">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Title</label>
            <input
              required
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              className="w-full rounded-md border px-3 py-2"
              placeholder="Japanese for Beginners"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={draft.description ?? ""}
              onChange={(e) =>
                setDraft({ ...draft, description: e.target.value })
              }
              className="w-full rounded-md border px-3 py-2"
              placeholder="Short summary..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={draft.price}
              onChange={(e) =>
                setDraft({ ...draft, price: Number(e.target.value) })
              }
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Published</label>
            <div className="flex items-center gap-2">
              <input
                id="published"
                type="checkbox"
                checked={draft.published}
                onChange={(e) =>
                  setDraft({ ...draft, published: e.target.checked })
                }
              />
              <label htmlFor="published" className="text-sm text-muted-foreground">
                Hiển thị cho học viên
              </label>
            </div>
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <Button type="submit" disabled={creating || updating}>
              {isEditing ? "Update course" : "Create course"}
            </Button>
            {isEditing && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDraft(emptyDraft)}
              >
                Cancel edit
              </Button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-xl border bg-background p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Courses</h2>
          {loading && <span className="text-sm text-muted-foreground">Loading...</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-muted-foreground">
              <tr>
                <th className="py-2 pr-4">Title</th>
                <th className="py-2 pr-4">Price</th>
                <th className="py-2 pr-4">Published</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.courses.map((course) => (
                <tr key={course.id} className="border-t">
                  <td className="py-2 pr-4">{course.title}</td>
                  <td className="py-2 pr-4">${course.price.toFixed(2)}</td>
                  <td className="py-2 pr-4">
                    {course.published ? "Yes" : "No"}
                  </td>
                  <td className="py-2 pr-4 space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setDraft({
                          id: course.id,
                          title: course.title,
                          description: course.description ?? "",
                          price: course.price,
                          published: course.published,
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(course.id)}
                      disabled={deleting}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {!loading && (data?.courses.length ?? 0) === 0 && (
                <tr>
                  <td className="py-4 text-muted-foreground" colSpan={4}>
                    Chưa có khóa học nào. Thêm mới ở form phía trên.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
      </div>
      </section>
    </div>
  )
}
