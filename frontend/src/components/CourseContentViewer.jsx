import { CheckCircle, Clock, Play } from "lucide-react";
import { getContentIcon } from "../utils/learnPage";
import {
  setCompletedTopics,
  setSelectedTopic,
  setExpandedModules,
} from "../redux/slices/learningPage";
import { useSelector, useDispatch } from "react-redux";
import courseData from "../data/pensionLearningData.json";
import retirementContent from "../data/WhyRetirementMatters";

const CourseContentViewer = ({ topic }) => {
  const { completedTopics, selectedTopic, expandedModules } = useSelector(
    (state) => state.learningPage
  );
  const dispatch = useDispatch();

  // Enhanced course data with dynamic content
  const enhancedCourseData = {
    ...courseData,
    modules: courseData.modules.map(module => ({
      ...module,
      topics: module.topics.map(topicItem => {
        // Replace content for specific topic ID
        if (topicItem.id === 1 && topicItem.title === "Why Retirement Planning Matters") {
          return {
            ...topicItem,
            content: retirementContent
          };
        }
        return topicItem;
      })
    }))
  };

  const markComplete = (topicId) => {
    if (!completedTopics.includes(topicId)) {
      const newCompleted = [...completedTopics, topicId];
      dispatch(setCompletedTopics(newCompleted));
    }
  };

  const handleNextTopic = () => {
    let foundCurrent = false;

    for (let i = 0; i < enhancedCourseData.modules.length; i++) {
      const module = enhancedCourseData.modules[i];

      for (let j = 0; j < module.topics.length; j++) {
        const topicItem = module.topics[j];

        if (topicItem.id === selectedTopic.id) {
          foundCurrent = true;

          if (j + 1 < module.topics.length) {
            const nextTopic = module.topics[j + 1];
            dispatch(setSelectedTopic(nextTopic));
            return;
          }

          for (let k = i + 1; k < enhancedCourseData.modules.length; k++) {
            const nextModule = enhancedCourseData.modules[k];
            dispatch(setExpandedModules([...expandedModules, nextModule.id]));
            if (nextModule.topics.length > 0) {
              dispatch(setSelectedTopic(nextModule.topics[0]));
              return;
            }
          }

          console.log("End of course reached");
          return;
        }
      }
    }

    if (!foundCurrent) {
      console.warn("Current topic not found in course data");
    }
  };

  // Get the enhanced topic with dynamic content
  const getEnhancedTopic = (originalTopic) => {
    if (!originalTopic) return null;

    // Find the enhanced topic from enhancedCourseData
    for (const module of enhancedCourseData.modules) {
      const enhancedTopic = module.topics.find(t => t.id === originalTopic.id);
      if (enhancedTopic) {
        return enhancedTopic;
      }
    }

    return originalTopic; // fallback to original if not found
  };

  const enhancedTopic = getEnhancedTopic(topic);

  if (!enhancedTopic) return null;

  // Improved content formatting function
  const formatContent = (content) => {
    if (!content) return null;

    // Split content into sections by double newlines
    const sections = content.split('\n\n');

    return sections.map((section, index) => {
      const trimmedSection = section.trim();

      // Skip empty sections
      if (!trimmedSection) return null;

      // Check if it's a numbered section (starts with number)
      if (/^\d+\.\s/.test(trimmedSection)) {
        const [title, ...rest] = trimmedSection.split('\n');
        return (
          <div key={index} className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-2 text-lg">{title}</h4>
            {rest.length > 0 && (
              <p className="text-gray-700 leading-relaxed">{rest.join(' ')}</p>
            )}
          </div>
        );
      }

      // Check if it's the "How to Start" section
      if (trimmedSection.startsWith('How to Start')) {
        const lines = trimmedSection.split('\n');
        const title = lines[0];

        // Get all lines that start with "- " (bullet points)
        const bulletPoints = lines.filter(line => line.trim().startsWith('- '));

        if (bulletPoints.length > 0) {
          return (
            <div key={index} className="mt-6 bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
              <h4 className="font-semibold text-blue-900 mb-4 text-lg">{title}</h4>
              <ul className="text-blue-800 space-y-3">
                {bulletPoints.map((item, itemIndex) => {
                  const cleanedItem = item.replace(/^-\s*/, '').trim();
                  return (
                    <li key={itemIndex} className="flex items-start">
                      <span className="text-blue-600 mr-3 mt-1 font-bold">•</span>
                      <span className="leading-relaxed">{cleanedItem}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        }
      }

      // Regular paragraph - check if it contains multiple sentences
      if (trimmedSection && !trimmedSection.startsWith('How to Start') && !/^\d+\.\s/.test(trimmedSection)) {
        return (
          <p key={index} className="text-gray-700 leading-relaxed mb-4">
            {trimmedSection}
          </p>
        );
      }

      return null;
    }).filter(Boolean);
  };

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm p-6 h-fit">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {getContentIcon(enhancedTopic.type)}
          <h2 className="text-2xl font-bold text-gray-900">{enhancedTopic.title}</h2>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {enhancedTopic.duration}
          </span>
          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
            {enhancedTopic.type.charAt(0).toUpperCase() + enhancedTopic.type.slice(1)}
          </span>
        </div>
      </div>

      {enhancedTopic.type === "video" && enhancedTopic.videoId && (
        <div className="mb-6">
          <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-inner">
            <iframe
              src={`https://www.youtube.com/embed/${enhancedTopic.videoId}?rel=0&modestbranding=1&showinfo=0`}
              title={enhancedTopic.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Play className="w-4 h-4" />
              <span>Video Lesson</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Duration: {enhancedTopic.duration}</span>
              <button
                className="text-blue-600 hover:text-blue-700 font-medium"
                onClick={() =>
                  window.open(
                    `https://www.youtube.com/watch?v=${enhancedTopic.videoId}`,
                    "_blank"
                  )
                }
              >
                Watch on YouTube ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {enhancedTopic.type === "article" && (
        <div className="prose max-w-none mb-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Article Content</h3>

            {enhancedTopic.content ? (
              <div className="space-y-4">
                {formatContent(enhancedTopic.content)}

                <div className="mt-8 bg-green-50 border-l-4 border-green-400 p-6 rounded-r-lg">
                  <h4 className="font-semibold text-green-900 mb-3 text-lg">
                    Key Takeaways
                  </h4>
                  <ul className="text-green-800 space-y-2">
                    <li className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1 font-bold">•</span>
                      <span>Early retirement planning is crucial for financial security</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1 font-bold">•</span>
                      <span>Compound interest works best with time and consistency</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1 font-bold">•</span>
                      <span>Healthcare costs and inflation must be factored into planning</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1 font-bold">•</span>
                      <span>Professional advice can help optimize your retirement strategy</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                <p className="text-gray-700 leading-relaxed mb-4">
                  This is where the article content would be displayed. The content would be loaded from the data.json file and could include rich text formatting, images, and embedded media.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  The article would cover comprehensive information about the topic,
                  including practical examples, case studies, and actionable advice
                  for retirement planning.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-6">
                  <h4 className="font-semibold text-blue-900 mb-2">
                    Key Takeaways
                  </h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Understanding is the foundation of good planning</li>
                    <li>• Early action leads to better outcomes</li>
                    <li>• Regular review and adjustment is essential</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {enhancedTopic.type === "infographic" && (
        <div className="mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-lg border-2 border-dashed border-blue-300">
            <img
              src="/Comparison.png"
              alt="Comparison infographic"
              className="w-full h-auto mx-auto mb-4 rounded-lg shadow-md object-contain"
            />
            <p className="text-center text-gray-700">Interactive Infographic</p>
            <p className="text-center text-sm text-gray-500 mt-2">
              Visual comparison charts and diagrams would be displayed here
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center pt-6 border-t border-black/30">
        <button
          onClick={() => markComplete(enhancedTopic.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${completedTopics.includes(enhancedTopic.id)
            ? "bg-green-100 text-green-700"
            : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
        >
          <CheckCircle className="w-4 h-4" />
          {completedTopics.includes(enhancedTopic.id)
            ? "Completed"
            : "Mark as Complete"}
        </button>
        <button
          onClick={handleNextTopic}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors bg-primary text-white hover:bg-blue-700"
        >
          <CheckCircle className="w-4 h-4" />
          Next
        </button>
      </div>
    </div>
  );
};

export default CourseContentViewer;