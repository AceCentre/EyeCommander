import React, { useEffect } from "react";
import dynamic from "next/dynamic";

const MediaPipeFaceMeshClient = dynamic(
  () => import("./MediaPipeFaceMeshClient"),
  { ssr: false }
);

export const MediaPipeFaceMesh = ({ ...props }) => {
  const [isClientSide, setIsClientSide] = React.useState(false);

  useEffect(() => {
    setIsClientSide(true);
  }, []);

  if (isClientSide) {
    return <MediaPipeFaceMeshClient {...props} />;
  } else {
    return null;
  }
};
