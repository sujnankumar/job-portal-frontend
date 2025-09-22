import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { Calendar, Clock, ArrowLeft, Share2, Bookmark, ThumbsUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import RelatedArticles from "@/components/related-articles"

export const metadata: Metadata = {
  title: "Article Title | Career Advice | WOWR",
  description: "Read our career advice article to help you in your job search",
}

// Mock data for a single article
const article = {
  id: "1",
  title: "10 Resume Tips That Will Help You Get Hired",
  content: `
    <p>Your resume is often the first impression you make on a potential employer. It's your chance to showcase your skills, experience, and qualifications in a way that sets you apart from other candidates. A well-crafted resume can open doors to interviews and job opportunities, while a poorly written one can quickly land in the rejection pile.</p>
    
    <p>In today's competitive job market, it's more important than ever to have a resume that stands out. Hiring managers and recruiters often review hundreds of resumes for a single position, spending just a few seconds on each one. That means you need to make an impact quickly and effectively.</p>
    
    <h2>1. Tailor Your Resume to the Job</h2>
    
    <p>One of the most important resume tips is to customize your resume for each job application. Review the job description carefully and highlight the skills and experiences that match what the employer is looking for. This doesn't mean you should fabricate information, but rather emphasize the most relevant aspects of your background.</p>
    
    <p>For example, if you're applying for a marketing position that requires experience with social media campaigns, make sure to prominently feature your social media marketing experience and achievements. This targeted approach shows employers that you're a good fit for the specific role they're trying to fill.</p>
    
    <h2>2. Use a Clean, Professional Format</h2>
    
    <p>Your resume should be easy to read and visually appealing. Use a clean, professional format with clear section headings and ample white space. Stick to a standard font like Arial, Calibri, or Times New Roman, and use a font size between 10 and 12 points for the body text.</p>
    
    <p>Avoid using excessive colors, graphics, or unusual fonts that can distract from your content. Remember, the focus should be on your qualifications, not on flashy design elements (unless you're applying for a creative position where design skills are relevant).</p>
    
    <h2>3. Start with a Strong Summary</h2>
    
    <p>Begin your resume with a strong professional summary or objective statement that highlights your most relevant skills and experiences. This section should be concise (2-3 sentences) and tailored to the position you're applying for.</p>
    
    <p>For example: "Results-driven marketing professional with 5+ years of experience developing and executing successful digital marketing campaigns. Skilled in SEO, content marketing, and social media strategy, with a track record of increasing web traffic and conversion rates."</p>
    
    <h2>4. Focus on Achievements, Not Just Duties</h2>
    
    <p>When describing your work experience, focus on your achievements rather than just listing your job duties. Use specific examples and quantify your results whenever possible. This helps employers understand the impact you've made in your previous roles.</p>
    
    <p>For example, instead of saying "Responsible for social media marketing," say "Increased social media engagement by 50% and grew follower base from 5,000 to 15,000 in six months through strategic content creation and community management."</p>
    
    <h2>5. Use Keywords from the Job Description</h2>
    
    <p>Many companies use Applicant Tracking Systems (ATS) to screen resumes before they reach human eyes. These systems scan for relevant keywords related to the job requirements. To increase your chances of getting past this initial screening, incorporate keywords from the job description into your resume where appropriate.</p>
    
    <p>Look for specific skills, qualifications, and experiences mentioned in the job posting, and make sure to include them in your resume if you possess them. This will help your resume rank higher in the ATS and increase the likelihood of it being reviewed by a hiring manager.</p>
    
    <h2>6. Keep It Concise</h2>
    
    <p>In most cases, your resume should be no longer than one to two pages. Recruiters and hiring managers have limited time, so they appreciate concise, well-organized information. Focus on your most recent and relevant experiences, and don't feel obligated to include every job you've ever had.</p>
    
    <p>For those with extensive experience, prioritize the positions and achievements that are most relevant to the job you're applying for. You can briefly summarize older or less relevant roles.</p>
    
    <h2>7. Proofread Carefully</h2>
    
    <p>Spelling and grammatical errors can quickly undermine your credibility and attention to detail. Proofread your resume carefully, and consider having someone else review it as well. Fresh eyes can often catch mistakes that you might have missed.</p>
    
    <p>Pay attention to consistency in formatting, tense, and punctuation. Small details matter and can make a big difference in how your resume is perceived.</p>
    
    <h2>8. Include Relevant Skills and Certifications</h2>
    
    <p>Include a dedicated skills section that highlights your relevant technical and soft skills. This is especially important for positions that require specific technical abilities or software proficiency.</p>
    
    <p>Also, include any relevant certifications, licenses, or professional development courses you've completed. These credentials can set you apart from other candidates and demonstrate your commitment to your field.</p>
    
    <h2>9. Update Your Contact Information</h2>
    
    <p>Make sure your contact information is current and professional. Include your name, phone number, email address, and LinkedIn profile (if you have one). Your email address should be professional – ideally some variation of your name rather than a casual or humorous address.</p>
    
    <p>Consider including your location (city and state), but you don't need to provide your full address. If you're willing to relocate for a position, you can mention that as well.</p>
    
    <h2>10. Customize for Different Formats</h2>
    
    <p>Be prepared to adapt your resume for different submission formats. Some applications may require a PDF, while others might ask for a Word document or plain text. Having multiple versions ready can save you time and ensure your resume looks good in any format.</p>
    
    <p>For online applications, a PDF is often the best choice as it preserves your formatting regardless of how it's viewed. However, some ATS prefer Word documents, so it's good to have both options available.</p>
    
    <h2>Conclusion</h2>
    
    <p>Creating an effective resume takes time and effort, but it's a crucial step in your job search. By following these tips, you can craft a resume that showcases your qualifications, catches the attention of employers, and increases your chances of landing interviews.</p>
    
    <p>Remember, your resume is a living document that should evolve as you gain new skills and experiences. Regularly update it and tailor it for each job application to maximize your chances of success in the job market.</p>
  `,
  category: "Resume & Cover Letters",
  author: {
    name: "Jane Smith",
    title: "Career Coach",
    image: "/placeholder.svg?height=100&width=100&query=professional headshot",
  },
  date: "May 15, 2023",
  image: "/placeholder.svg?height=600&width=1200&query=resume writing",
  readTime: "8 min read",
  tags: ["Resume", "Job Search", "Career Advice", "Job Application"],
}

export default function ArticleDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/career-advice" className="flex items-center text-accent hover:underline">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Career Advice
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="relative h-64 md:h-80 w-full bg-light-gray">
              <Image src={article.image || "/placeholder.svg"} alt={article.title} fill className="object-cover" />
            </div>

            <div className="p-6 md:p-8">
              <Badge className="mb-4 bg-accent text-white">{article.category}</Badge>

              <h1 className="text-2xl md:text-3xl font-bold text-dark-gray mb-4">{article.title}</h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {article.date}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {article.readTime}
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={article.author.image || "/placeholder.svg"}
                    alt={article.author.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-medium text-dark-gray">{article.author.name}</div>
                  <div className="text-sm text-gray-500">{article.author.title}</div>
                </div>
              </div>

              <Separator className="mb-6" />

              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex flex-wrap gap-2 mb-6">
                  {article.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="bg-light-gray">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful
                    </Button>
                    <Button variant="outline" size="sm">
                      <Bookmark className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>

                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </article>
        </div>

        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold text-dark-gray mb-4">About the Author</h2>

            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={article.author.image || "/placeholder.svg"}
                  alt={article.author.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <div className="font-medium text-dark-gray text-lg">{article.author.name}</div>
                <div className="text-gray-500">{article.author.title}</div>
              </div>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              Jane is a certified career coach with over 10 years of experience helping job seekers land their dream
              jobs. She specializes in resume writing, interview preparation, and career transitions.
            </p>

            <Button variant="outline" className="w-full">
              View All Articles by Jane
            </Button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <h2 className="text-xl font-semibold text-dark-gray mb-4">Subscribe to Our Newsletter</h2>

            <p className="text-gray-600 text-sm mb-4">
              Get the latest career advice, job search tips, and industry insights delivered straight to your inbox.
            </p>

            <form className="space-y-4">
              <input
                type="email"
                placeholder="Your email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              <Button className="w-full bg-accent hover:bg-accent/90">Subscribe</Button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-dark-gray mb-4">Popular Tags</h2>

            <div className="flex flex-wrap gap-2">
              {[
                "Resume",
                "Interview",
                "Job Search",
                "Career Development",
                "Networking",
                "Remote Work",
                "Salary Negotiation",
                "Cover Letter",
              ].map((tag) => (
                <Badge key={tag} variant="outline" className="bg-light-gray cursor-pointer hover:bg-gray-200">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-dark-gray mb-6">Related Articles</h2>
        <RelatedArticles />
      </div>
    </div>
  )
}
