import React, { useState, useRef } from "react";
import { Wheel } from "react-custom-roulette";
import { Box, Button, ButtonProps, Modal, styled } from "@mui/material";
import { red } from "@mui/material/colors";
import "./App.css";

// 상품 재고 수량 (가정)
const inventory = {
  first: 1,   // 1등 상품 수량
  second: 2,  // 2등 상품 수량
  third: 3,   // 3등 상품 수량
  fourth: 5, // 4등 상품 수량
  fifth: 10,  // 5등 상품 수량
};

// 데이터 타입 정의
interface PrizeData {
  option: string;
  style: {
    backgroundColor: string;
    textColor: string;
    textShadow: string; // Optional textShadow property
  };
  probability: number;
  imageUrl: string;
}

// 데이터 배열 수정 (1~5등, 꽝으로 구성)
const data: PrizeData[] = [
  {
    option: "1등",
    style: {
      backgroundColor: "#9ccefd",
      textColor: "black",
      textShadow: "2px 2px 0px white, -2px -2px 0px white, -2px 2px 0px white, 2px -2px 0px white",
    }, // Gold for 1st prize
    probability: inventory.first > 0 ? 2 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000294741/vs_image800.jpg?1725245400",
  },
  {
    option: "2등",
    style: {
      backgroundColor: "#ee024a",
      textColor: "white",
      textShadow: "2px 2px 0px white, -2px -2px 0px white, -2px 2px 0px white, 2px -2px 0px white",
    }, // Bright Orange for 2nd prize
    probability: inventory.second > 0 ? 5 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000262710/vs_image800.jpg?1725245520",
  },
  {
    option: "3등",
    style: {
      backgroundColor: "#b9dc88",
      textColor: "white",
      textShadow: "2px 2px 0px white, -2px -2px 0px white, -2px 2px 0px white, 2px -2px 0px white",
    }, // Lime Green for 3rd prize
    probability: inventory.third > 0 ? 10 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000204053/vs_image800.jpg?1725245580",
  },
  {
    option: "4등",
    style: {
      backgroundColor: "#02dccb",
      textColor: "white",
      textShadow: "2px 2px 0px white, -2px -2px 0px white, -2px 2px 0px white, 2px -2px 0px white",
    }, // Black for 4th prize
    probability: inventory.fourth > 0 ? 20 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000281263/vs_image800.jpg?1725245640",
  },
  {
    option: "5등",
    style: {
      backgroundColor: "#00cfff",
      textColor: "white",
      textShadow: "2px 2px 0px white, -2px -2px 0px white, -2px 2px 0px white, 2px -2px 0px white",
    }, // Blue for 5th prize
    probability: inventory.fifth > 0 ? 23 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000281263/vs_image800.jpg?1725245640", // 4등과 같은 이미지 사용
  },
  {
    option: "꽝",
    style: {
      backgroundColor: "#fe8dcb",
      textColor: "white",
      textShadow: "2px 2px 0px white, -2px -2px 0px white, -2px 2px 0px white, 2px -2px 0px white",
    }, // Dark Red for 'Lose'
    probability: 100,
    imageUrl: "",
  },
  // 데이터 복사하여 룰렛을 균형있게 만듭니다.
  {
    option: "1등",
    style: {
      backgroundColor: "#9ccefd",
      textColor: "black",
      textShadow: "2px 2px 0px white, -2px -2px 0px white, -2px 2px 0px white, 2px -2px 0px white",
    },
    probability: inventory.first > 0 ? 2 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000294741/vs_image800.jpg?1725245400",
  },
  {
    option: "2등",
    style: {
      backgroundColor: "#ee024a",
      textColor: "white",
      textShadow: "2px 2px 0px white, -2px -2px 0px white, -2px 2px 0px white, 2px -2px 0px white",
    },
    probability: inventory.second > 0 ? 5 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000262710/vs_image800.jpg?1725245520",
  },
  {
    option: "3등",
    style: {
      backgroundColor: "#b9dc88",
      textColor: "white",
      textShadow: "2px 2px 0px white, -2px -2px 0px white, -2px 2px 0px white, 2px -2px 0px white",
    },
    probability: inventory.third > 0 ? 10 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000204053/vs_image800.jpg?1725245580",
  },
  {
    option: "4등",
    style: {
      backgroundColor: "#02dccb",
      textColor: "white",
      textShadow: "2px 2px 0px white, -2px -2px 0px white, -2px 2px 0px white, 2px -2px 0px white",
    },
    probability: inventory.fourth > 0 ? 20 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000281263/vs_image800.jpg?1725245640",
  },
  {
    option: "5등",
    style: {
      backgroundColor: "#00cfff",
      textColor: "white",
      textShadow: "2px 2px 0px white, -2px -2px 0px white, -2px 2px 0px white, 2px -2px 0px white",
    },
    probability: inventory.fifth > 0 ? 23 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000281263/vs_image800.jpg?1725245640",
  },
  {
    option: "꽝",
    style: {
      backgroundColor: "#fe8dcb",
      textColor: "white",
      textShadow: "2px 2px 0px white, -2px -2px 0px white, -2px 2px 0px white, 2px -2px 0px white",
    },
    probability: 100,
    imageUrl: "",
  },
];


const StartButton = styled(Button)<ButtonProps>(({ theme }) => ({
  marginTop: "20px",
  marginBottom: "50px", // 버튼과 GIF가 겹치지 않도록 추가
  width: "200px",
  fontSize: 20,
  color: "#fff",
  backgroundColor: red[500],
  padding: "10px",
  borderRadius: "10px",
  "&:hover": {
    backgroundColor: red[700],
    color: "#fff",
  },
}));

function App() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [isResultShow, setIsResultShow] = useState<boolean>(false);
  const [showGif, setShowGif] = useState(false);
  const [result, setResult] = useState<{ date: string; result: string }>({
    date: "",
    result: "",
  });

  const sendToGoogleSheets = (prize: string) => {
    const participationTime = new Date().toLocaleString(); // 참여 시간 생성
    const data = {
      participationId: Math.floor(Math.random() * 10000), // 임의의 참여 번호 생성
      participationTime,
      prize,
      firstStock: inventory.first,
      secondStock: inventory.second,
      thirdStock: inventory.third,
      fourthStock: inventory.fourth,
      fifthStock: inventory.fifth,
    };
  
    fetch('https://script.google.com/macros/s/AKfycbyKleMGBvgZlHHVgaITLqbZRqqDlVfTfE2t5Dian7IC9VSBQv7xX04Naqg7-G7Jf3ZfWw/exec', {
      method: 'POST',
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(data),
      mode: 'cors'
    })
    .then(response => {
      if (response.ok) {
        console.log('Google Sheets 전송 성공:', response);
        alert('이벤트 응모가 완료되었습니다.');
      } else {
        console.error('Google Sheets 전송 에러:', response);
        alert('이벤트 응모 중 오류가 발생했습니다.');
      }
    })
    .catch((error) => {
      console.error('Google Sheets 전송 에러:', error);
      alert('이벤트 응모 중 오류가 발생했습니다.');
    });
  };


  const handleSpinClick = () => {
    if (mustSpin) return;
    startRoulette();
  };

  const startRoulette = () => {
    const probabilities = data.map((item) => item.probability);
    const totalProbability = probabilities.reduce((acc, curr) => acc + curr, 0);
    const random = Math.random() * totalProbability;

    let cumulativeProbability = 0;
    let selectedIndex = 0;

    for (let i = 0; i < probabilities.length; i++) {
      cumulativeProbability += probabilities[i];
      if (random < cumulativeProbability) {
        selectedIndex = i;
        break;
      }
    }

    setPrizeNumber(selectedIndex);
    setMustSpin(true);
  };

  const saveResult = () => {
    const prize = data[prizeNumber]?.option || "Unknown"; // 당첨 결과를 prize에 저장
    const resultData = {
      ...result,
      date: new Date().toISOString(),
      result: prize,
    };
  
    setResult(resultData);
    sendToGoogleSheets(prize); // Google Sheets로 데이터 전송
  
    if (prize === "1등") {
      setShowGif(true);
      setTimeout(() => {
        setShowGif(false);
        setIsResultShow(true);
      }, 1000); // 1초간 GIF 표시 후 숨김
    } else {
      setIsResultShow(true);
    }
  };


  const getResultMessage = () => {
    switch (data[prizeNumber].option) {
      case "1등":
        return "🏆1등 당첨🎉";
      case "2등":
        return "🥇2등 당첨🎁";
      case "3등":
        return "🥈3등 당첨👏";
      case "4등":
        return "🥉4등 당첨😉";
      case "5등":
        return "🎖5등 당첨🙂";
      case "꽝":
        return "🧨꽝💥";
      default:
        return "";
    }
  };

  return (
    <>
      <div className="roulette-layout">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>        
          <Wheel
            mustStartSpinning={mustSpin}
            data={data.map((item) => ({
              option: item.option,
              style: item.style,
            }))}
            prizeNumber={prizeNumber}
            outerBorderWidth={1}
            innerBorderWidth={1}
            radiusLineWidth={1}
            innerRadius={1}
            fontSize={20}
            onStopSpinning={() => {
              setMustSpin(false);
              saveResult();
            }}
            spinDuration={1}
            backgroundColors={data.map((item) => item.style.backgroundColor)}
            textColors={data.map((item) => item.style.textColor)}
          />
          <StartButton variant="outlined" size="large" onClick={handleSpinClick}>
            Start
          </StartButton>
        </div>

        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%" }}>
          <img src="/asset/banner.gif" alt="Slot Machine GIF" style={{ width: "auto", height: "auto" }} />
        </div>


        {showGif && (
          <Modal
            open={true}
            style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
          >
            <img
              src="https://i.namu.wiki/i/aEaRClFwgm0hl2PFb7-j20_WC99GnPFUkg6njz_IckIXXx_UZDELGldWijSZw-IqYOFXeUJNF41HESd380w0Og.gif"
              alt="1등 당첨 축하 GIF"
              style={{ width: "100vw", height: "100vh", objectFit: "cover" }}
            />
          </Modal>
        )}

        <Modal
          open={isResultShow}
          onClose={() => setIsResultShow(false)}
          style={{ cursor: "pointer" }}
          onClick={() => setIsResultShow(false)}
        >
          <Box
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              width: "640px",
              height: "360px",
              maxWidth: "100vw",
              maxHeight: "100vh",
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              overflowY: "auto",
            }}
          >
            {data[prizeNumber].imageUrl && (
              <img
                src={data[prizeNumber].imageUrl}
                alt={data[prizeNumber].option}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0.5,
                  objectFit: "cover",
                }}
              />
            )}
            <span
              style={{
                fontSize: "60px",
                color: "black",
                zIndex: 2,
              }}
            >
              {getResultMessage()}
            </span>
          </Box>
        </Modal>
      </div>
    </>
  );
}

export default App;
