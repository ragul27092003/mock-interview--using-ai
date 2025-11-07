import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { Interview } from "@/types";
import { CustomBreadCrumb } from "./custom-bread-crumb";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Loader, Trash2 } from "lucide-react";
import { Separator } from "./ui/separator";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { chatSession } from "@/scripts";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/config/firebase.config";
import Headings from "./headings";

interface FormMockInterviewProps {
  initialData: Interview | null;
}

const formSchema = z.object({

  position: z
    .string()
    .min(1, "Position is required")
    .max(100, "Position must be 100 characters or less"),
  description: z.string().min(5, "Description is required"),
  experience: z
    .coerce.number()
    .min(0, "Experience cannot be empty or negative")
    .max(50, "Experience must not exceed 50 years"),
  techStack: z.string().min(1, "Tech stack is required"),
  numberOfQuestions: z
    .coerce.number()
    .min(1, "Must be at least 1")
    .max(20, "Must not exceed 20"),
});

type FormData = z.infer<typeof formSchema>;

export const FormMockInterview = ({ initialData }: FormMockInterviewProps) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
  });

  const { isValid, isSubmitting } = form.formState;
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { userId } = useAuth();

  const title = initialData ? initialData.position : "Create a new mock interview";
  const breadCrumpPage = initialData ? initialData.position : "Create";
  const actions = initialData ? "Save Changes" : "Create";
  const toastMessage = initialData
    ? { title: "Updated..!", description: "Changes saved successfully..." }
    : { title: "Created..!", description: "New Mock Interview created..." };

  const [resume, setResume] = useState<File | null>(null);
  const [resumePreview, setResumePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const cleanAiResponse = (responseText: string) => {
    let cleanText = responseText.trim();
    cleanText = cleanText.replace(/(json|``|)/g, "");
    const jsonArrayMatch = cleanText.match(/\[.*\]/s);
    if (jsonArrayMatch) {
      cleanText = jsonArrayMatch[0];
    } else {
      throw new Error("No JSON array found in response");
    }

    try {
      return JSON.parse(cleanText);
    } catch (error) {
      throw new Error("Invalid JSON format: " + (error as Error)?.message);
    }
  };

  const generateAiResponse = async (data: FormData) => {
    const prompt = `
      As an experienced interview coach and AI, generate a JSON array of ${data.numberOfQuestions} technical interview questions and brief model answers.
      The questions should reflect the style and for the role of ${data.position}.
      Focus on ${data.techStack} and real-world problem-solving. Each question must be relevant to candidates with ${data.experience} years of experience.

      Format:
      [
        { "question": "<Question text>", "answer": "<Answer text>" },
        ...
      ]

      Return ONLY the JSON array.
    `;

    const aiResult = await chatSession.sendMessage(prompt);
    return cleanAiResponse(aiResult.response.text());
  };

  const handleResumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5000000) {
        toast.error("File is too large! Please upload a file under 5MB.");
        return;
      }
      setResume(file);
      const fileUrl = URL.createObjectURL(file);
      setResumePreview(fileUrl);
    }
  };

  const handleResumeButtonClick = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      const aiResult = await generateAiResponse(data);

      if (initialData) {
        await updateDoc(doc(db, "interviews", initialData.id), {
          questions: aiResult,
          ...data,
          updatedAt: serverTimestamp(),
        });
      } else {
        await addDoc(collection(db, "interviews"), {
          ...data,
          userId,
          questions: aiResult,
          createdAt: serverTimestamp(),
        });
      }

      toast(toastMessage.title, { description: toastMessage.description });
      navigate("/generate", { replace: true });
    } catch (error) {
      console.log(error);
      toast.error("Error..", {
        description: "Something went wrong. Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      form.reset({
        position: initialData.position,
        description: initialData.description,
        experience: initialData.experience,
        techStack: initialData.techStack,
        numberOfQuestions: 5,
      });
    }
  }, [initialData, form]);

  const handleReset = () => {
    form.reset({
      position: "",
      description: "",
      experience: 0,
      techStack: "",
      numberOfQuestions: 0,
    });
    setResume(null);
    setResumePreview(null);
    toast("Form reset successfully", {
      description: "All fields have been cleared.",
    });
  };

  return (
    <div className="w-full flex-col space-y-4">
      <CustomBreadCrumb
        breadCrumbPage={breadCrumpPage}
        breadCrumpItems={[{ label: "Mock Interviews", link: "/generate" }]}
      />

      <div className="mt-4 flex items-center justify-between w-full">
        <Headings title={title} isSubHeading />
        {initialData && (
          <Button size="icon" variant="ghost">
            <Trash2 className="min-w-4 min-h-4 text-red-500" />
          </Button>
        )}
      </div>

      <Separator className="my-4" />

      <FormProvider {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full p-8 rounded-lg flex-col flex items-start justify-start gap-6 shadow-md"
        >
          

          {/* Position */}
          <FormField control={form.control} name="position" render={({ field }) => (
            <FormItem className="w-full space-y-4">
              <div className="w-full flex items-center justify-between">
                <FormLabel>Job Role / Job Position</FormLabel>
                <FormMessage className="text-sm" />
              </div>
              <FormControl>
                <Input className="h-12" disabled={loading} placeholder="eg: Frontend Engineer" {...field} value={field.value || ""} />
              </FormControl>
            </FormItem>
          )} />

          {/* Description */}
          <FormField control={form.control} name="description" render={({ field }) => (
            <FormItem className="w-full space-y-4">
              <div className="w-full flex items-center justify-between">
                <FormLabel>Job Description</FormLabel>
                <FormMessage className="text-sm" />
              </div>
              <FormControl>
                <Textarea className="h-12" disabled={loading} placeholder="Describe your job role" {...field} value={field.value || ""} />
              </FormControl>
            </FormItem>
          )} />

          {/* Experience */}
          <FormField control={form.control} name="experience" render={({ field }) => (
            <FormItem className="w-full space-y-4">
              <div className="w-full flex items-center justify-between">
                <FormLabel>Years of Experience</FormLabel>
                <FormMessage className="text-sm" />
              </div>
              <FormControl>
                <Input type="number" className="h-12" disabled={loading} placeholder="eg: 5 Years" {...field} value={field.value || ""} />
              </FormControl>
            </FormItem>
          )} />

          {/* Tech Stack */}
          <FormField control={form.control} name="techStack" render={({ field }) => (
            <FormItem className="w-full space-y-4">
              <div className="w-full flex items-center justify-between">
                <FormLabel>Tech Stacks</FormLabel>
                <FormMessage className="text-sm" />
              </div>
              <FormControl>
                <Textarea className="h-12" disabled={loading} placeholder="eg: React, TypeScript..." {...field} value={field.value || ""} />
              </FormControl>
            </FormItem>
          )} />

          {/* Number of Questions */}
          <FormField control={form.control} name="numberOfQuestions" render={({ field }) => (
            <FormItem className="w-full space-y-4">
              <div className="w-full flex items-center justify-between">
                <FormLabel>Number of Questions</FormLabel>
                <FormMessage className="text-sm" />
              </div>
              <FormControl>
                <Input type="number" className="h-12" disabled={loading} placeholder="eg: 5" {...field} value={field.value || ""} />
              </FormControl>
            </FormItem>
          )} />
          

          {/* Resume Upload */}
          <div className="font-extrabold text-red-950 flex flex-col gap-4">
            <Button type="button" onClick={handleResumeButtonClick} variant="outline" disabled={loading}>
              Upload Resume
            </Button>
            <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleResumeChange} />
            {resume && <p className="text-sm text-gray-500 mt-2">File selected: {resume.name}</p>}
            {resumePreview && (
              <div className="mt-4">
                <a href={resumePreview} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  Preview Resume
                </a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="w-full flex items-center justify-end gap-6">
            <Button type="button" size="sm" variant="outline" onClick={handleReset} disabled={isSubmitting || loading}>
              Reset
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting || !isValid || loading}>
              {loading ? <Loader className="text-gray-50 animate-spin" /> : actions}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};
