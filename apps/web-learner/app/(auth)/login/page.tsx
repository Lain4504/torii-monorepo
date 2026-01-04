import { LoginForm } from "@/components/auth/login-form"
import { BookOpen, Video, BrainCircuit } from 'lucide-react';

export default function LoginPage() {
    return (
        <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Left Panel - Learner Value Props */}
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
                <div className="absolute inset-0 bg-blue-600" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-700 to-blue-500 opacity-90" />

                <div className="relative z-20 flex items-center text-lg font-medium">
                    <BookOpen className="mr-2 h-6 w-6" />
                    Torii Nihongo
                </div>

                <div className="relative z-20 mt-auto">
                    <blockquote className="space-y-2">
                        <p className="text-lg">
                            "The combination of live classes and AI feedback has accelerated my JLPT N3 preparation by months."
                        </p>
                        <footer className="text-sm">Minh, Software Engineer</footer>
                    </blockquote>
                </div>

                <div className="relative z-20 mt-10 grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 text-sm text-blue-100">
                        <Video className="h-4 w-4" />
                        <span>Live WebRTC Classes</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-blue-100">
                        <BrainCircuit className="h-4 w-4" />
                        <span>AI Handwriting Feedback</span>
                    </div>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="lg:p-8">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email to continue your learning journey
                        </p>
                    </div>

                    <LoginForm />

                    <p className="px-8 text-center text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <a
                            href="/register"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Sign up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}
