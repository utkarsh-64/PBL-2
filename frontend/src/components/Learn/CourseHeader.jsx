import { BookOpen, Clock, Award } from "lucide-react";

export default function CourseHeader({ courseData }) {
  return (
    <div className="w-full px-6 py-8 bg-white shadow-sm">
      {/* Title & Description */}
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-gray-900 leading-snug bg-gradient-to-r from-gray-700 via-blue-800 to-blue-900 bg-clip-text text-transparent">
          {courseData.title}
        </h1>
        <p className="text-gray-600 text-md">{courseData.description}</p>
      </div>

      {/* Stats */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2 px-3 py-1 rounded-md border border-gray-200 bg-gray-50">
          <BookOpen className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-gray-800">
            {courseData.totalModules} Modules
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-md border border-gray-200 bg-gray-50">
          <Clock className="w-4 h-4 text-green-600" />
          <span className="font-medium text-gray-800">
            {courseData.estimatedTime} Duration
          </span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-md border border-gray-200 bg-gray-50">
          <Award className="w-4 h-4 text-orange-600" />
          <span className="font-medium text-gray-800">
            {courseData.difficulty} Level
          </span>
        </div>
      </div>
    </div>
  );
}
