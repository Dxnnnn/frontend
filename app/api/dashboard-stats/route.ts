import { NextResponse } from "next/server";
import { getAuthHeaders } from "@/lib/server/auth-header";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function GET() {
  try {
    const headers = await getAuthHeaders();

    const [studentsRes, facultyRes, evaluationsRes, semestersRes, subjectsRes] = await Promise.all([
      fetch(`${BACKEND}/api/students`, { cache: "no-store", headers }),
      fetch(`${BACKEND}/api/faculty`, { cache: "no-store" }),
      fetch(`${BACKEND}/api/evaluations?source=all`, { cache: "no-store", headers }),
      fetch(`${BACKEND}/api/semesters`, { cache: "no-store" }),
      fetch(`${BACKEND}/api/subjects`, { cache: "no-store" }),
    ]);

    const studentsData = await studentsRes.json() as { students?: Array<{ student_level: string }> };
    const facultyData = await facultyRes.json() as { faculty?: Array<{ id: number; name: string; department: string }> };
    const evaluationsData = await evaluationsRes.json() as { submissions?: Array<{ department: string; source: string; facultyId: number; facultyName: string; scoringAnswers: Record<string, number> }> };
    const semestersData = await semestersRes.json() as { semesters?: Array<{ id: string; schoolYear: string; term: string; isActive: boolean }> };
    const subjectsData = await subjectsRes.json() as { subjects?: unknown[] };

    const students = studentsData.students ?? [];
    const faculty = facultyData.faculty ?? [];
    const submissions = evaluationsData.submissions ?? [];
    const semesters = semestersData.semesters ?? [];
    const totalSubjects = subjectsData.subjects?.length ?? 0;

    // Active semester
    const activeSemester = semesters.find((s) => s.isActive);

    // Students by level
    const studentsByLevel = {
      college: students.filter((s) => s.student_level === "college").length,
      "senior-high": students.filter((s) => s.student_level === "senior-high").length,
      "junior-high": students.filter((s) => s.student_level === "junior-high").length,
      elementary: students.filter((s) => s.student_level === "elementary").length,
    };

    // Evaluations by department
    const deptCounts: Record<string, number> = {};
    for (const sub of submissions) {
      const dept = sub.department?.split("(")[0].trim() ?? "Other";
      deptCounts[dept] = (deptCounts[dept] ?? 0) + 1;
    }

    // Student vs school head submissions
    const studentSubmissions = submissions.filter((s) => s.source === "student" || !s.source).length;
    const schoolHeadSubmissions = submissions.filter((s) => s.source === "school_head").length;

    // Top rated faculty (average score from scoringAnswers)
    const facultyScores: Record<string, { name: string; scores: number[]; count: number }> = {};
    for (const sub of submissions) {
      const id = String(sub.facultyId ?? sub.facultyName);
      if (!facultyScores[id]) {
        facultyScores[id] = { name: sub.facultyName, scores: [], count: 0 };
      }
      const answers = sub.scoringAnswers ?? {};
      const vals = Object.values(answers).filter((v) => typeof v === "number") as number[];
      if (vals.length > 0) {
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        facultyScores[id].scores.push(avg);
        facultyScores[id].count++;
      }
    }

    const topFaculty = Object.entries(facultyScores)
      .map(([, v]) => ({
        name: v.name,
        avgScore: v.scores.length > 0 ? v.scores.reduce((a, b) => a + b, 0) / v.scores.length : 0,
        evaluationCount: v.count,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      totalStudents: students.length,
      totalFaculty: faculty.length,
      totalSubjects,
      totalEvaluations: submissions.length,
      studentSubmissions,
      schoolHeadSubmissions,
      activeSemester: activeSemester
        ? `SY-${activeSemester.schoolYear} ${activeSemester.term}`
        : null,
      studentsByLevel,
      evaluationsByDept: deptCounts,
      topFaculty,
    });
  } catch (err) {
    console.error("[dashboard-stats]", err);
    return NextResponse.json({ success: false, totalStudents: 0 }, { status: 500 });
  }
}
