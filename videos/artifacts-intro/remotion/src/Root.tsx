import React from "react";
import { Composition, staticFile } from "remotion";
import { Prod } from "./Prod";
import { FPS, SIZES, type Aspect, type ProdProps, type Take, type TimelineT } from "./theme";

const IDS = ["hero", "ep1", "ep2", "ep3", "ep4", "ep5", "ep6", "ep7"];
export const Root: React.FC = () => (
  <>
    {IDS.flatMap((pid) => (["A", "B"] as Take[]).flatMap((take) => (["16x9", "9x16"] as Aspect[]).map((aspect) => (
      <Composition
        key={`${pid}-${take}-${aspect}`} id={`${pid}-${take}-${aspect}`} component={Prod as any}
        width={SIZES[aspect].width} height={SIZES[aspect].height} fps={FPS} durationInFrames={FPS * 10}
        defaultProps={{ timeline: null, take, aspect } as ProdProps}
        calculateMetadata={async ({ props }) => {
          const timeline: TimelineT = await (await fetch(staticFile(`${pid}.timeline.json`))).json();
          return { durationInFrames: Math.round(timeline.total * FPS), props: { ...props, timeline } };
        }}
      />
    ))))}
  </>
);
