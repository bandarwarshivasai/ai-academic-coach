import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import connectToDatabase from "@/lib/mongoose";
import Streak from "@/models/Streak";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  // @ts-ignore
  let streak = await Streak.findOne({ userId: session.user.id });
  if (!streak) {
    // @ts-ignore
    streak = await Streak.create({ userId: session.user.id });
  }
  return NextResponse.json({ streak });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  await connectToDatabase();
  // @ts-ignore
  let streak = await Streak.findOne({ userId: session.user.id });
  if (!streak) {
    // @ts-ignore
    streak = await Streak.create({ userId: session.user.id });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  // Check if already marked today
  const alreadyMarked = streak.studyDates.some((d: Date) => {
    const dd = new Date(d); dd.setHours(0, 0, 0, 0);
    return dd.toISOString() === todayStr;
  });

  if (alreadyMarked) {
    return NextResponse.json({ streak, message: "Already marked today" });
  }

  // Consecutive check
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString();

  const studiedYesterday = streak.studyDates.some((d: Date) => {
    const dd = new Date(d); dd.setHours(0, 0, 0, 0);
    return dd.toISOString() === yesterdayStr;
  });

  streak.studyDates.push(today);
  streak.lastStudyDate = today;
  streak.currentStreak = studiedYesterday ? streak.currentStreak + 1 : 1;
  streak.longestStreak = Math.max(streak.currentStreak, streak.longestStreak);

  // Badge logic
  const badges = new Set(streak.badges as string[]);
  if (streak.currentStreak >= 7) badges.add("🔥 7-Day Streak");
  if (streak.currentStreak >= 30) badges.add("🏆 30-Day Champion");
  if (streak.studyDates.length >= 50) badges.add("📚 Consistency Champion");
  streak.badges = Array.from(badges);

  await streak.save();

  return NextResponse.json({ streak });
}
