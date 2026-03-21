import { useDispatch, useSelector } from "react-redux";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Clock,
  BookOpen,
} from "lucide-react";
import courseData from "../data/pensionLearningData.json";
import { getContentIcon } from "../utils/learnPage";
import CourseContentViewer from "../components/CourseContentViewer";
import CourseHeader from "../components/Learn/CourseHeader";
import {
  setSelectedTopic,
  setExpandedModules,
} from "../redux/slices/learningPage";

const LearnPage = () => {
  const { completedTopics, selectedTopic, expandedModules } = useSelector(
    (state) => state.learningPage
  );
  const dispatch = useDispatch();

  const toggleModule = (moduleId) => {
    if (expandedModules.includes(moduleId)) {
      dispatch(
        setExpandedModules(expandedModules.filter((id) => id !== moduleId))
      );
    } else {
      dispatch(setExpandedModules([...expandedModules, moduleId]));
    }
  };

  const selectTopic = (moduleId, topic) => {
    dispatch(setSelectedTopic(topic));
  };

  return (
    <div className="min-h-screen flex-1 overflow-y-auto">
      {/* Header */}
      <CourseHeader courseData={courseData} />

      <div className="mx-auto p-5">
        <div className="flex gap-4">
          {/* Main Content Area */}
          {selectedTopic ? (
            <CourseContentViewer topic={selectedTopic} />
          ) : (
            <div className="flex-1 bg-white rounded-lg shadow-sm px-12 py-24 text-center h-fit">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Pension Planning & Retirement
              </h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Select a topic from the roadmap to begin your learning journey.
                Each module builds upon the previous one to give you
                comprehensive knowledge of retirement planning.
              </p>
              <button
                onClick={() => {
                  setExpandedModules([1]);
                  selectTopic(1, courseData.modules[0].topics[0]);
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start Learning
              </button>
            </div>
          )}

          {/* Sidebar - Course Roadmap */}
          <div className="w-96 bg-white rounded-lg shadow-sm h-fit">
            <div className="p-4 border-b border-black/30">
              <h2 className="text-xl font-bold text-gray-900">
                Course Roadmap
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {completedTopics.size} topics completed
              </p>
            </div>

            <div className="p-4">
              {courseData.modules.map((module, moduleIndex) => (
                <div key={module.id} className="mb-4 last:mb-0">
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">
                        {moduleIndex + 1}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {module.title}
                        </h3>
                        <p className="text-xs text-gray-600">
                          {module.duration}
                        </p>
                      </div>
                    </div>
                    {expandedModules.includes(module.id) ? (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Module Content */}
                  {expandedModules.includes(module.id) && (
                    <div className="mt-2 ml-4 space-y-2">
                      <p className="text-xs text-gray-600 mb-3 pl-7">
                        {module.description}
                      </p>

                      {module.topics.map((topic, topicIndex) => (
                        <button
                          key={topic.id}
                          onClick={() => selectTopic(module.id, topic)}
                          className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                            selectedTopic?.id === topic.id
                              ? "bg-blue-100 border-blue-200"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center">
                            {completedTopics.includes(topic.id) ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  selectedTopic?.id === topic.id
                                    ? "bg-blue-600"
                                    : "bg-gray-300"
                                }`}
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {getContentIcon(topic.type)}
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {topic.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {topic.duration}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnPage;
