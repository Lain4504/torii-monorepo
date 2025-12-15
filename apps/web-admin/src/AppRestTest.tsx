import { useState } from 'react';
import { useCourseControllerFindAll, useCourseControllerCreate } from '@workspace/data-access/rest';

export function AppRestTest() {
    const { data: courses, isLoading, refetch } = useCourseControllerFindAll();
    const { mutate: createCourse, isPending } = useCourseControllerCreate();
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(0);

    const handleCreate = () => {
        createCourse(
            { data: { title, price, published: true, description: 'Created via REST' } },
            {
                onSuccess: () => {
                    setTitle('');
                    setPrice(0);
                    refetch();
                },
            }
        );
    };

    return (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 shadow-sm mt-8">
            <h2 className="text-xl font-bold text-blue-900 mb-4">REST API Test (Orval + React Query)</h2>

            <div className="mb-6 grid gap-4 md:grid-cols-3 items-end">
                <div>
                    <label className="block text-sm font-medium text-blue-800">Title</label>
                    <input
                        className="w-full rounded border px-3 py-2"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="New Course Title"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-blue-800">Price</label>
                    <input
                        type="number"
                        className="w-full rounded border px-3 py-2"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                    />
                </div>
                <button
                    className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                    onClick={handleCreate}
                    disabled={isPending || !title}
                >
                    {isPending ? 'Creating...' : 'Create via REST'}
                </button>
            </div>

            {isLoading ? (
                <p>Loading REST data...</p>
            ) : (
                <ul className="space-y-2">
                    {courses?.map((course: any) => (
                        <li key={course.id} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                            <span className="font-medium">{course.title}</span>
                            <span className="text-gray-600">${course.price}</span>
                        </li>
                    ))}
                    {courses?.length === 0 && <p className="text-gray-500">No courses found via REST.</p>}
                </ul>
            )}
        </div>
    );
}
