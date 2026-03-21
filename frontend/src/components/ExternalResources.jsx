import { useState } from "react";
import {
  ExternalLink,
  Play,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const ExternalResources = ({ resources }) => {
  const [expandedSections, setExpandedSections] = useState({
    videos: true,
    articles: true,
  });

  if (
    !resources ||
    (!resources.youtube_videos?.length && !resources.blog_articles?.length)
  ) {
    return null;
  }

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const extractVideoId = (url) => {
    const match = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
    );
    return match ? match[1] : null;
  };

  const VideoCard = ({ video }) => {
    const [showEmbed, setShowEmbed] = useState(false);
    const videoId = extractVideoId(video.url);

    if (video.type === "search_link") {
      return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start space-x-3">
            <Play className="h-5 w-5 text-red-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">{video.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{video.description}</p>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Search YouTube
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {showEmbed && videoId ? (
          <div className="aspect-video">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={video.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="relative">
            {video.thumbnail && (
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full aspect-video object-cover"
              />
            )}
            <button
              onClick={() => setShowEmbed(true)}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-50 transition-opacity"
            >
              <Play className="h-12 w-12 text-white" />
            </button>
          </div>
        )}

        <div className="p-4">
          <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
            {video.title}
          </h4>
          {video.channel && (
            <p className="text-sm text-gray-600 mb-2">by {video.channel}</p>
          )}
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {video.description}
          </p>
          <div className="flex items-center space-x-3">
            {!showEmbed && (
              <button
                onClick={() => setShowEmbed(true)}
                className="inline-flex items-center text-sm text-red-600 hover:text-red-800"
              >
                <Play className="h-4 w-4 mr-1" />
                Watch Here
              </button>
            )}
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open in YouTube
            </a>
          </div>
        </div>
      </div>
    );
  };

  const ArticleCard = ({ article }) => {
    if (article.type === "search_link") {
      return (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start space-x-3">
            <BookOpen className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 mb-1">
                {article.title}
              </h4>
              <p className="text-sm text-gray-600 mb-3">
                {article.description}
              </p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Search Google
              </a>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-lg p-4 border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="flex items-start space-x-3">
          <BookOpen className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
          <div className="flex-1">
            <h4 className="font-medium text-gray-900 mb-2 line-clamp-2">
              {article.title}
            </h4>
            {article.source && (
              <p className="text-sm text-gray-500 mb-2">
                Source: {article.source}
              </p>
            )}
            <p className="text-sm text-gray-600 mb-3 line-clamp-3">
              {article.description}
            </p>
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Read Article
            </a>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          📚 Learning Resources: {resources.topic}
        </h3>
        <p className="text-sm text-blue-800">
          Here are some educational resources to help you learn more about this
          topic:
        </p>
      </div>

      {/* YouTube Videos Section */}
      {resources.youtube_videos?.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => toggleSection("videos")}
            className="flex items-center justify-between w-full text-left mb-3"
          >
            <h4 className="text-md font-medium text-blue-900 flex items-center">
              <Play className="h-4 w-4 mr-2 text-red-600" />
              Video Resources ({resources.youtube_videos.length})
            </h4>
            {expandedSections.videos ? (
              <ChevronUp className="h-4 w-4 text-blue-700" />
            ) : (
              <ChevronDown className="h-4 w-4 text-blue-700" />
            )}
          </button>

          {expandedSections.videos && (
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {resources.youtube_videos.map((video, index) => (
                <VideoCard key={index} video={video} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Blog Articles Section */}
      {resources.blog_articles?.length > 0 && (
        <div>
          <button
            onClick={() => toggleSection("articles")}
            className="flex items-center justify-between w-full text-left mb-3"
          >
            <h4 className="text-md font-medium text-blue-900 flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-blue-600" />
              Article Resources ({resources.blog_articles.length})
            </h4>
            {expandedSections.articles ? (
              <ChevronUp className="h-4 w-4 text-blue-700" />
            ) : (
              <ChevronDown className="h-4 w-4 text-blue-700" />
            )}
          </button>

          {expandedSections.articles && (
            <div className="grid gap-3">
              {resources.blog_articles.map((article, index) => (
                <ArticleCard key={index} article={article} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExternalResources;
