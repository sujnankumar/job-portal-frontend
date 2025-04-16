import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import EmployerLogin from "@/components/employer-login"
import EmployerRegistration from "@/components/employer-registration"

export default function EmployerAuthPage() {
  return (
    <div className="container mx-auto max-w-md py-12 px-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-dark-gray">Employer Portal</h1>
        <p className="text-gray-500 mt-2">Access your employer dashboard to post jobs and manage applications</p>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <Tabs defaultValue="login">
          <TabsList className="w-full border-b rounded-t-xl rounded-b-none p-0">
            <TabsTrigger
              value="login"
              className="flex-1 rounded-tl-xl rounded-tr-none rounded-bl-none rounded-br-none py-3"
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="flex-1 rounded-tr-xl rounded-tl-none rounded-bl-none rounded-br-none py-3"
            >
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="p-6">
            <EmployerLogin />
          </TabsContent>

          <TabsContent value="register" className="p-6">
            <EmployerRegistration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
