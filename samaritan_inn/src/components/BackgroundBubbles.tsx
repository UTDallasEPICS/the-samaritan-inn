
'use client';

import React from 'react';

const BackgroundBubbles = () => {
  return (
    <>
      <div
        aria-hidden="true"
        className="background-bubbles"
      >
        {/* Left circles */}
        <span className="bubble bubble-left-top" />
        <span className="bubble bubble-left-bottom" />

        {/* Right circles */}
        <span className="bubble bubble-right-top" />
        <span className="bubble bubble-right-middle" />
      </div>

      <style jsx>{`
        .background-bubbles {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 0;
        }

        .bubble {
          position: absolute;
          display: block;
          box-sizing: border-box;
          border: 1px solid #071b9a;
          border-radius: 50%;
          background: transparent;
        }

        .bubble-left-top {
          width: 232px;
          height: 232px;
          left: -17px;
          top: 49%;
        }

        .bubble-left-bottom {
          width: 370px;
          height: 370px;
          left: -209px;
          top: 67.2%;
        }

        .bubble-right-top {
          width: 370px;
          height: 370px;
          right: -233px;
          top: 16%;
        }

        .bubble-right-middle {
          width: 185px;
          height: 185px;
          right: 2%;
          top: 46%;
        }

        @media (max-width: 600px) {
          .bubble-left-top {
            left: -55px;
            top: 38%;
          }

          .bubble-left-bottom {
            left: -125px;
            top: 65%;
          }

          .bubble-right-top {
            right: -150px;
            top: 12%;
          }

          .bubble-right-middle {
            right: -35px;
            top: 48%;
          }
        }
      `}</style>
    </>
  );
};

export default BackgroundBubbles;