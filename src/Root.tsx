import "./index.css";
import { Composition, getStaticFiles } from "remotion";
import ViralVideo, { viralVideoSchema } from "./components/ViralVideo";
import { FPS, VIDEO_WIDTH, VIDEO_HEIGHT } from "./lib/constants";
import {
  loadViralTimelineFromFile,
  getViralTimelinePath,
  loadSentenceSegments,
  getSentenceSegmentsPath,
} from "./lib/utils";

export const RemotionRoot: React.FC = () => {
  const staticFiles = getStaticFiles();

  // Find all viral timeline projects (they have videoSrc in timeline.json)
  const viralProjects = staticFiles
    .filter((file) => file.name.endsWith("timeline.json"))
    .map((file) => file.name.split("/")[1]);

  return (
    <>
      {viralProjects.map((projectName) => (
        <Composition
          key={projectName}
          id={projectName}
          component={ViralVideo}
          fps={FPS}
          width={VIDEO_WIDTH}
          height={VIDEO_HEIGHT}
          schema={viralVideoSchema}
          defaultProps={{
            timeline: null,
            sentences: [],
          }}
          calculateMetadata={async ({ props }) => {
            console.log("Loading metadata for:", projectName);
            const [{ lengthFrames, timeline }, sentences] = await Promise.all([
              loadViralTimelineFromFile(getViralTimelinePath(projectName)),
              loadSentenceSegments(getSentenceSegmentsPath(projectName)),
            ]);
            console.log("Loaded timeline:", timeline?.shortTitle, "sentences:", sentences.length);

            return {
              durationInFrames: lengthFrames,
              props: {
                ...props,
                timeline,
                sentences,
              },
            };
          }}
        />
      ))}
    </>
  );
};
