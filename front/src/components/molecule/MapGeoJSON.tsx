import { LeafletMouseEventHandlerFn, PathOptions } from "leaflet";
import { PropsWithChildren } from "react";
import { GeoJSON } from "react-leaflet";

interface Props {
  data: GeoJSON.GeoJsonObject;
  attr: string;
  pathOptions?: PathOptions;
  interactive?: boolean;
  onClick?: LeafletMouseEventHandlerFn;
}

export default function MapGeoJSON({
  data,
  attr,
  pathOptions,
  interactive = true,
  onClick,
  children,
}: PropsWithChildren<Props>) {
  return (
    <GeoJSON
      data={data}
      attribution={attr}
      pathOptions={pathOptions}
      interactive={interactive}
      eventHandlers={{ click: onClick }}
    >
      {children}
    </GeoJSON>
  );
}
