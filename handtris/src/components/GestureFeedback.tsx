import Image from "next/image";

interface GestureImages {
  [key: string]: string;
}

const gestureImages: GestureImages = {
  "Move Right": "/image/right.png",
  "Move Left": "/image/left.png",
  Rotate: "/image/rotate.png",
  Drop: "/image/drop.png",
};

interface GestureFeedbackProps {
  gestureFeedback: string;
}

const GestureFeedback: React.FC<GestureFeedbackProps> = ({
  gestureFeedback,
}) => {
  const imageUrl: string | undefined = gestureImages[gestureFeedback];

  return (
    <div>
      <Image
        src={imageUrl}
        width={200}
        height={200}
        alt={gestureFeedback.toLowerCase()}
      />
    </div>
  );
};

export default GestureFeedback;
