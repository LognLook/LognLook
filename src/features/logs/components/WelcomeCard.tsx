import React from "react";

const WelcomeCard: React.FC = () => {
  return (
    <div
      className="
    bg-[#1E435F]
    w-[18.9vw] min-w-[272px] max-w-[300px]
    h-auto
    rounded-xl
    px-5 pt-5 pb-4
  "
    >
      <h2 className="whitespace-nowrap text-[24px] font-bold font-pretendard text-[#B8FFF1]">
        Welcome Seyoung!
      </h2>
      <p className="text-[14px] font-normal font-pretendard text-[#B8FFF1] leading-snug mt-1">
        Check out what's going on.
      </p>
    </div>
  );
};

export default WelcomeCard;
