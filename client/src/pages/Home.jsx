import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Home() {
    const { user } = useAuth()

    return (
        <main className="min-h-[70vh] flex items-center">
            <div className="max-w-4xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-[auto,1fr] items-center">



                <div>
                    <h1 className="text-4xl font-bold tracking-tight">
                        Turn meetings into action.
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Meeting-to-Action helps you use meeting notes to generate
                        suggested action items with AI, assign owners and due dates,
                        and track follow-through across meetings.
                    </p>



                    <div className="mt-8 flex flex-wrap gap-3">
                        {user ? (
                            <>
                                <Link
                                    to="/meetings"
                                    className="px-4 py-2 rounded bg-[#0091af] text-white hover:bg-[#007a93]"
                                >
                                    Go to Meetings
                                </Link>

                                <Link
                                    to="/my-items"
                                    className="px-4 py-2 rounded border hover:bg-gray-50"
                                >
                                    View My Items
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 rounded bg-[#0091af] text-white hover:bg-[#007a93]"
                                >
                                    Create Account
                                </Link>
                                <Link
                                    to="/login"
                                    className="px-4 py-2 rounded border hover:bg-gray-50"
                                >
                                    Log In
                                </Link>
                            </>
                        )}
                    </div>

                    <p className="mt-6 text-sm text-gray-500">
                        Tip: Add notes on a meeting’s page and click <em>AI Suggest</em> to generate action items,
                        then convert selected suggestions into real tasks.
                    </p>
                </div>
            </div>
        </main>
    )
}
