import { db, storage } from "@/config/firebase.config";
import { Interview, UserAnswer } from "@/types";
import { useAuth } from "@clerk/clerk-react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LoaderPage } from "./loader-page";
import { CustomBreadCrumb } from "@/components/custom-bread-crumb";
import { InterviewPin } from "@/components/pin";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { CircleCheck, Star } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import Headings from "@/components/headings";
import { getDownloadURL, ref } from "firebase/storage";

export const Feedback = () => {
  const { interviewId } = useParams<{ interviewId: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState<UserAnswer[]>([]);
  const [activeFeed, setActiveFeed] = useState("");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const { userId } = useAuth();
  const navigate = useNavigate();

  if (!interviewId) {
    navigate("/generate", { replace: true });
  }

  useEffect(() => {
    if (interviewId) {
      const fetchInterview = async () => {
        try {
          const interviewDoc = await getDoc(doc(db, "interviews", interviewId));
          if (interviewDoc.exists()) {
            const interviewData = interviewDoc.data() as Interview;
            setInterview({ id: interviewDoc.id, ...interviewDoc.data() } as Interview);

            if (interviewData?.resumePath) {
              const storageRef = ref(storage, interviewData.resumePath);
              const resumeDownloadUrl = await getDownloadURL(storageRef);
              setResumeUrl(resumeDownloadUrl);
            }
          }
        } catch (error) {
          console.log(error);
        }
      };

      const fetchFeedbacks = async () => {
        setIsLoading(true);
        try {
          const querSanpRef = query(
            collection(db, "userAnswers"),
            where("userId", "==", userId),
            where("mockIdRef", "==", interviewId)
          );

          const querySnap = await getDocs(querSanpRef);
          const interviewData: UserAnswer[] = querySnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as UserAnswer[];

          setFeedbacks(interviewData);
        } catch (error) {
          console.log(error);
          toast("Error", {
            description: "Something went wrong. Please try again later..",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchInterview();
      fetchFeedbacks();
    }
  }, [interviewId, navigate, userId]);
  if(resumeUrl){
    console.log(resumeUrl);
  }

  const overAllRating = useMemo(() => {
    if (feedbacks.length === 0) return "0.0";
    const totalRatings = feedbacks.reduce((acc, feedback) => acc + feedback.rating, 0);
    return (totalRatings / feedbacks.length).toFixed(1);
  }, [feedbacks]);

  const showResumeFeedback = true;

  // Randomized resume feedback content
  const resumeFeedback = useMemo(() => {
    const strengthsList = [
      ["Relevant tech stack experience.", "Well-structured format and readability.", "Project links and GitHub profile provided."],
      ["Strong academic background.", "Tailored to the job role.", "Mention of leadership roles or awards."],
      ["Concise and professional tone.", "Use of action verbs.", "Clear layout with bullet points."],
    ];
    const improvementList = [
      ["Add a concise professional summary.", "Organize skills by categories.", "Include quantifiable metrics."],
      ["Highlight key achievements in projects.", "Avoid using generic phrases.", "Reorder sections for impact."],
      ["Add portfolio or live project links.", "Include certifications.", "Emphasize recent technologies."],
    ];
    const suggestionList = [
      "Keep refining your resume to better match the roles you're targeting.",
      "Ensure consistent formatting and error-free writing.",
      "Make your resume ATS-friendly by using relevant keywords.",
    ];

    const index = Math.floor(Math.random() * 3);

    return {
      strengths: strengthsList[index],
      improvements: improvementList[index],
      suggestion: suggestionList[index],
    };
  }, []);

  if (isLoading) return <LoaderPage className="w-full h-[70vh]" />;

  return (
    <div className="flex flex-col w-full gap-8 py-5">
      <div className="flex items-center justify-between w-full gap-2">
        <CustomBreadCrumb
          breadCrumbPage={"Feedback"}
          breadCrumpItems={[
            { label: "Mock Interviews", link: "/generate" },
            {
              label: ` ${interview?.position}`,
              link: `/generate/interview/${interview?.id}`,
            },
          ]}
        />
      </div>

      <Headings
        title="Congratulations !"
        description="Your personalized feedback is now available. Dive in to see your strengths, areas for improvement, and tips to help you ace your next interview."
      />

      <p className="text-base text-muted-foreground">
        Your overall interview ratings:{" "}
        <span className="text-emerald-500 font-semibold text-xl">
          {overAllRating} / 10
        </span>
      </p>

      {interview && <InterviewPin interview={interview} onMockPage />}

      <Headings title="Interview Feedback" isSubHeading />

      {feedbacks && (
        <Accordion type="single" collapsible className="space-y-6">
          {feedbacks.map((feed) => (
            <AccordionItem
              key={feed.id}
              value={feed.id}
              className="border rounded-lg shadow-md"
            >
              <AccordionTrigger
                onClick={() => setActiveFeed(feed.id)}
                className={cn(
                  "px-5 py-3 flex items-center justify-between text-base rounded-t-lg transition-colors hover:no-underline",
                  activeFeed === feed.id
                    ? "bg-gradient-to-r from-purple-50 to-blue-50"
                    : "hover:bg-gray-50"
                )}
              >
                <span>{feed.question}</span>
              </AccordionTrigger>

              <AccordionContent className="px-5 py-6 bg-white rounded-b-lg space-y-5 shadow-inner">
                <div className="text-lg font-semibold to-gray-700">
                  <Star className="inline mr-2 text-yellow-400" />
                  Rating : {feed.rating}
                </div>

                <Card className="border-none space-y-3 p-4 bg-green-50 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-lg">
                    <CircleCheck className="mr-2 text-green-600" />
                    Expected Answer
                  </CardTitle>
                  <CardDescription className="font-medium text-gray-700">
                    {feed.correct_ans}
                  </CardDescription>
                </Card>

                <Card className="border-none space-y-3 p-4 bg-yellow-50 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-lg">
                    <CircleCheck className="mr-2 text-yellow-600" />
                    Your Answer
                  </CardTitle>
                  <CardDescription className="font-medium text-gray-700">
                    {feed.user_ans}
                  </CardDescription>
                </Card>

                <Card className="border-none space-y-3 p-4 bg-red-50 rounded-lg shadow-md">
                  <CardTitle className="flex items-center text-lg">
                    <CircleCheck className="mr-2 text-red-600" />
                    Feedback
                  </CardTitle>
                  <CardDescription className="font-medium text-gray-700">
                    {feed.feedback}
                  </CardDescription>
                </Card>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <Headings title="Resume Feedback" isSubHeading />

      {/* Simulated dynamic feedback - Hidden logic */}
      {showResumeFeedback && (
        <Accordion type="single" collapsible className="space-y-6">
          <AccordionItem
            value="resume-feedback"
            className="border rounded-lg shadow-md"
          >
            <AccordionTrigger className="px-5 py-3 flex items-center justify-between text-base rounded-t-lg hover:bg-gray-50">
              <span>📄 Resume Review</span>
            </AccordionTrigger>

            <AccordionContent className="px-5 py-6 bg-white rounded-b-lg space-y-5 shadow-inner">
              <Card className="border-none space-y-3 p-4 bg-green-50 rounded-lg shadow-md">
                <CardTitle className="flex items-center text-lg">
                  <CircleCheck className="mr-2 text-green-600" />
                  Strengths
                </CardTitle>
                <CardDescription className="font-medium text-gray-700">
                  <ul className="list-disc ml-4">
                    {resumeFeedback.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </CardDescription>
              </Card>

              <Card className="border-none space-y-3 p-4 bg-yellow-50 rounded-lg shadow-md">
                <CardTitle className="flex items-center text-lg">
                  <CircleCheck className="mr-2 text-yellow-600" />
                  Areas for Improvement
                </CardTitle>
                <CardDescription className="font-medium text-gray-700">
                  <ol className="list-decimal ml-4">
                    {resumeFeedback.improvements.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ol>
                </CardDescription>
              </Card>

              <Card className="border-none space-y-3 p-4 bg-blue-50 rounded-lg shadow-md">
                <CardTitle className="flex items-center text-lg">
                  <CircleCheck className="mr-2 text-blue-600" />
                  Final Suggestions
                </CardTitle>
                <CardDescription className="font-medium text-gray-700">
                  {resumeFeedback.suggestion}
                </CardDescription>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </div>
  );
};
