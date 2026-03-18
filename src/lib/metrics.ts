import connectToDatabase from "./mongoose";
import StudyParameter from "@/models/StudyParameter";
import mongoose from "mongoose";

type MetricType = "tasksCompleted" | "aiInteractions" | "documentCount" | "studyHours";

export async function updateAcademicMetrics(userId: string, type: MetricType, value: number = 1) {
  try {
    await connectToDatabase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let parameter = await StudyParameter.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date: { $gte: today }
    });

    if (!parameter) {
      parameter = await StudyParameter.create({
        userId: new mongoose.Types.ObjectId(userId),
        date: today,
        studyHours: 0,
        sleepHours: 8, // Default
        attendancePercentage: 100, // Default
        internalMarks: 0,
        practiceTestScores: 0,
        tasksCompleted: 0,
        aiInteractions: 0,
        documentCount: 0
      });
    }

    if (type === "studyHours") {
      parameter.studyHours += value;
    } else {
      parameter[type] = (parameter[type] || 0) + value;
      
      // Heuristic: Auto-calculate study hours based on actions if not explicitly set
      // Every task = 0.5h, Every doc = 0.2h, Every 10 AI queries = 0.1h
      const calculatedHours = (parameter.tasksCompleted * 0.5) + (parameter.documentCount * 0.2) + (parameter.aiInteractions * 0.05);
      // Only update studyHours if it's less than calculated (to represent minimum effort)
      if (parameter.studyHours < calculatedHours) {
         parameter.studyHours = Math.min(24, Math.round(calculatedHours * 10) / 10);
      }
    }

    await parameter.save();
    return parameter;
  } catch (error) {
    console.error("[Metrics] Failed to update academic metrics:", error);
  }
}
