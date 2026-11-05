import React from "react";
import { Composition, staticFile } from "remotion";
import { Prod } from "./Prod";
import { FPS, SIZES, type Aspect, type ProdProps, type TimelineT } from "./theme";

// id: <production>-<aspect>[c]  (c = burned-in captions)
const COMPS: [string, Aspect, boolean][] = [["main", "16x9", false], ["main", "16x9", true], ["short", "9x16", true], ["main", "9x16", true], ["main", "1x1", true]];
export const Root: React.FC = () => (
  <>
    {COMPS.map(([pid, aspect, captions]) => (
      <Composition
        key={`${pid}-${aspect}${captions ? "c" : ""}`} id={`${pid}-${aspect}${captions ? "c" : ""}`} component={Prod as any}
        width={SIZES[aspect].width} height={SIZES[aspect].height} fps={FPS} durationInFrames={FPS * 10}
        defaultProps={{ timeline: null, aspect, captions } as ProdProps}
        calculateMetadata={async ({ props }) => {
          const timeline: TimelineT = await (await fetch(staticFile(`${pid}.timeline.json`))).json();
          return { durationInFrames: Math.round(timeline.total * FPS), props: { ...props, timeline } };
        }}
      />
    ))}
  </>
);
