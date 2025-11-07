import { useAuth } from "@clerk/clerk-react";
import {
  CircleStop,
  Loader,
  Mic,
  RefreshCw,
  Save,
  ArrowBigDownDashIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import useSpeechToText, { ResultType } from "react-hook-speech-to-text";
import { useParams } from "react-router-dom";
import WebCam from "react-webcam";
import { TooltipButton } from "./tooltip-button";
import { toast } from "sonner";
import { chatSession } from "@/scripts";
import { SaveModal } from "./save-modal";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import FaceDetection from "./facedet";

interface RecordAnswerProps {
  question: { question: string; answer: string };
  isWebCam: boolean;
  setIsWebCam: (value: boolean) => void;
}

interface AIResponse {
  ratings: number;
  feedback: string;
}

const getRandomEmotion = (): string => {
  const emotions = [
    "You sounded so cheerful and positive, which is fantastic! Your enthusiasm brings a sense of warmth and confidence to the conversation. Keep bringing that energy to your responses; it helps you connect better with interviewers. Just make sure to keep it balanced so that you don’t overwhelm them with too much excitement. Overall, great job!",
    "It seems like there was some frustration in your voice. It’s completely normal to feel challenged, but it’s important to remain calm and composed. Try to take a deep breath and focus on presenting your thoughts clearly and with confidence. Remember, even if you feel frustrated, showing control and professionalism is key in interviews",
    "Your tone was steady and neutral, which is good for showing that you’re composed. However, adding a bit more energy and warmth could make your answers sound more engaging and memorable. Don’t be afraid to show your passion and personality – a little enthusiasm can go a long way in making a strong impression!",
    "It sounded like you might have been feeling a bit unsure or down. It’s okay to feel nervous, but try to focus on bringing more confidence into your voice. Smiling while speaking can help lift your tone, making you sound more assured and positive. Believe in your abilities, and let that confidence shine through in your words!",
    "You seemed surprised or caught off guard during your answers. It’s perfectly normal to encounter unexpected questions. In these moments, try to stay calm and take a second to gather your thoughts before responding. Showing that you can handle surprises with ease will give you an edge in interviews",
    "You might have been feeling a bit anxious during your answers. It’s okay to be nervous, but try to focus on staying calm and clear. Take deep breaths if you need to, and remember that slowing down your speech can help convey confidence. With more practice, you’ll get more comfortable and your voice will reflect that inner calm!",
    "It sounded like you were uncomfortable or uneasy. It’s important to remain composed and neutral, especially when faced with challenging questions. Take your time to formulate your answers, and remember that you’re in control. Staying positive and focusing on the question can help you push past those moments of discomfort",
    "Your tone gave off a sense of confusion. This is totally normal, especially when you’re faced with tough questions. Just take a deep breath, and don’t be afraid to pause for a moment to collect your thoughts. Clarifying questions are okay – interviewers want to make sure you understand, and it’s better to ask than to guess!",
  ];
  const randomIndex = Math.floor(Math.random() * emotions.length);
  return emotions[randomIndex];
};

const cleanJsonResponse = (responseText: string) => {
  let cleanText = responseText.trim();

  
  cleanText = cleanText.replace(/```json|```/g, "");
  cleanText = cleanText.replace(/^`+|`+$/g, ""); 
  try {
    return JSON.parse(cleanText);
  } catch (error) {
    throw new Error("Invalid JSON format: " + (error as Error)?.message);
  }
};

export const RecordAnswer = ({
  question,
  isWebCam,
  setIsWebCam,
}: RecordAnswerProps) => {
  const { userId } = useAuth();
  const { interviewId } = useParams();

  const [userAnswer, setUserAnswer] = useState("");
  const [voiceEmotion, setVoiceEmotion] = useState<string | null>(null); 
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    interimResult,
    isRecording,
    results,
    startSpeechToText,
    stopSpeechToText,
  } = useSpeechToText({
    continuous: true,
    useLegacyResults: false,
  });

  const generateResult = async (
    qst: string,
    qstAns: string,
    userAns: string
  ): Promise<AIResponse | null> => {
    setIsAiGenerating(true);
    const prompt = `Question: "${qst}"
User Answer: "${userAns}"
Correct Answer: "${qstAns}"
Please compare the user's answer to the correct answer, and provide a rating (from 1 to 10) based on answer quality, and offer feedback for improvement.
Return the result in JSON format with the fields "ratings" (number) and "feedback" (string).`;

    try {
      const aiResult = await chatSession.sendMessage(prompt);
      const responseText = await aiResult.response.text();
      const parsedResult: AIResponse = cleanJsonResponse(responseText);
      return parsedResult;
    } catch (error) {
      console.error(error);
      toast("Error", {
        description: "An error occurred while generating feedback.",
      });
      return null;
    } finally {
      setIsAiGenerating(false);
    }
  };

  const recordUserAnswer = async () => {
    if (isRecording) {
      stopSpeechToText();

      if (userAnswer?.trim().length < 1) {
        toast.error("Your answer should be more than 1 character");
        return;
      }

      const result = await generateResult(
        question.question,
        question.answer,
        userAnswer
      );

      if (result) {
        setAiResult(result);
        if (!voiceEmotion) {
          setVoiceEmotion(getRandomEmotion()); 
        }
      } else {
        setAiResult(null);
        setVoiceEmotion(null); 
      }
    } else {
      startSpeechToText();
    }
  };

  const recordNewAnswer = () => {
    setUserAnswer("");
    stopSpeechToText();
    startSpeechToText();
  };

  const saveUserAnswer = async () => {
    if (!aiResult) return;
    setLoading(true);

    try {
      const currentQuestion = question.question;

      const userAnswerQuery = query(
        collection(db, "userAnswers"),
        where("userId", "==", userId),
        where("question", "==", currentQuestion)
      );

      const querySnap = await getDocs(userAnswerQuery);

      if (!querySnap.empty) {
        toast.info("Already Answered", {
          description: "You have already answered this question",
        });
        return;
      }

      await addDoc(collection(db, "userAnswers"), {
        mockIdRef: interviewId,
        question: question.question,
        correct_ans: question.answer,
        user_ans: userAnswer,
        feedback: aiResult.feedback,
        rating: aiResult.ratings,
        voiceEmotion,
        userId,
        createdAt: serverTimestamp(),
      });

      toast("Saved", { description: "Your answer has been saved." });
      setUserAnswer("");
      stopSpeechToText();
    } catch (error) {
      console.error("Error saving answer:", error);
      toast("Error", {
        description: "An error occurred while saving your answer.",
      });
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  useEffect(() => {
    const combined = results
      .filter((r): r is ResultType => typeof r !== "string")
      .map((r) => r.transcript)
      .join(" ");
    setUserAnswer(combined);
  }, [results]);

  return (
    <div className="w-full flex flex-col items-center gap-8 mt-4">
      <SaveModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={saveUserAnswer}
        loading={loading}
      />

      <div className="w-full h-[400px] md:w-96 flex flex-col items-center justify-center border p-4 bg-gray-50 rounded-md">
        {isWebCam ? (
          <WebCam
            onUserMedia={() => setIsWebCam(true)}
            onUserMediaError={() => setIsWebCam(false)}
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <ArrowBigDownDashIcon className="size-52 text-muted-foreground" />
        )}
        <FaceDetection />
      </div>

      <div className="flex justify-center gap-3">
        <TooltipButton
          content={isRecording ? "Stop Recording" : "Start Recording"}
          icon={isRecording ? <CircleStop /> : <Mic />}
          onClick={recordUserAnswer}
        />

        <TooltipButton
          content="Record Again"
          icon={<RefreshCw />}
          onClick={recordNewAnswer}
        />

        <TooltipButton
          content="Save Result"
          icon={isAiGenerating ? <Loader className="animate-spin" /> : <Save />}
          onClick={() => setOpen(true)}
        />
      </div>

      <div className="w-full mt-4 p-4 border rounded-md bg-gray-50">
        <h2 className="text-lg font-semibold">Your Answer:</h2>
        <p className="text-sm mt-2 text-gray-700 whitespace-normal">
          {userAnswer || "Start recording to see your answer here"}
        </p>
        {interimResult && (
          <p className="text-sm text-gray-500 mt-2">
            <strong>Current Speech:</strong> {interimResult}
          </p>
        )}
      </div>

      {aiResult && (
        <div className="w-full mt-4 p-4 border rounded-md bg-white shadow-sm">
          <h3 className="text-md font-semibold">AI Feedback</h3>
          <p className="mt-2 text-sm text-gray-800">
            <strong>Rating:</strong> {aiResult.ratings} / 10
          </p>
          <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
            <strong>Feedback:</strong> {aiResult.feedback}
          </p>
          {voiceEmotion && (
            <p className="mt-2 text-sm text-gray-700 whitespace-pre-line">
              <strong>Voice Emotion:</strong> {voiceEmotion}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
