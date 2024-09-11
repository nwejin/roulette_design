import React, { useState, useEffect, useRef } from "react";
import { Wheel } from "react-custom-roulette";
import {
  Box,
  Button,
  ButtonProps,
  Modal,
  Snackbar,
  Alert,
  styled,
} from "@mui/material";
import { red } from "@mui/material/colors";
import { QrReader } from "react-qr-reader";
import "./App.css";

// 임시 데이터베이스 배열
const qrcodesDB = ["digitaltransformation", "nongshim", "lee", "park", "yoon", "jung", "joe"];

// 상품 재고 수량 (가정)
const inventory = {
  first: 1,  // 1등 상품 수량
  second: 2, // 2등 상품 수량
  third: 5,  // 3등 상품 수량
  fourth: 10 // 4등 상품 수량
};

// 데이터 타입 정의
interface PrizeData {
  option: string;
  style: {
    backgroundColor: string;
    textColor: string;
  };
  probability: number;
  imageUrl: string;
}

// 기존 데이터 배열 5개였던 룰렛 데이터를 10개로 확장합니다.
const data: PrizeData[] = [
  {
    option: "1등",
    style: { backgroundColor: "#FFD700", textColor: "black" }, // Gold for 1st prize
    probability: inventory.first > 0 ? 3 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000294741/vs_image800.jpg?1725245400",
  },
  {
    option: "2등",
    style: { backgroundColor: "#FF4500", textColor: "white" }, // Bright Orange for 2nd prize
    probability: inventory.second > 0 ? 7 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000262710/vs_image800.jpg?1725245520",
  },
  {
    option: "3등",
    style: { backgroundColor: "#32CD32", textColor: "white" }, // Lime Green for 3rd prize
    probability: inventory.third > 0 ? 15 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000204053/vs_image800.jpg?1725245580",
  },
  {
    option: "4등",
    style: { backgroundColor: "#000000", textColor: "white" }, // Black for 4th prize
    probability: inventory.fourth > 0 ? 25 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000281263/vs_image800.jpg?1725245640",
  },
  {
    option: "꽝",
    style: { backgroundColor: "#8B0000", textColor: "white" }, // Dark Red for 'Lose'
    probability: 50,
    imageUrl: "",
  },
  // 기존의 5개 데이터 복사하여 10개로 확장
  {
    option: "1등",
    style: { backgroundColor: "#FFD700", textColor: "black" }, // Duplicate for balance
    probability: inventory.first > 0 ? 3 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000294741/vs_image800.jpg?1725245400",
  },
  {
    option: "2등",
    style: { backgroundColor: "#FF4500", textColor: "white" }, // Duplicate for balance
    probability: inventory.second > 0 ? 7 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000262710/vs_image800.jpg?1725245520",
  },
  {
    option: "3등",
    style: { backgroundColor: "#32CD32", textColor: "white" }, // Duplicate for balance
    probability: inventory.third > 0 ? 15 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000204053/vs_image800.jpg?1725245580",
  },
  {
    option: "4등",
    style: { backgroundColor: "#000000", textColor: "white" }, // Duplicate for balance
    probability: inventory.fourth > 0 ? 25 : 0,
    imageUrl: "https://cdn.funshop.co.kr//products/0000281263/vs_image800.jpg?1725245640",
  },
  {
    option: "꽝",
    style: { backgroundColor: "#8B0000", textColor: "white" }, // Duplicate for balance
    probability: 50,
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
  const [noti, setNoti] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [user, setUser] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showGif, setShowGif] = useState(false);
  const [result, setResult] = useState<{ date: string; result: string; qrcode?: string }>({
    date: "",
    result: "",
  });

  const currentAudio = useRef<HTMLAudioElement | null>(null); // 현재 재생 중인 오디오 트래킹

  // handleScan 함수 추가
  const handleScan = (result: any) => {
    if (result) {
      const scannedText = result?.text || "";  // QR 코드에서 추출한 텍스트
      setUser(scannedText);
      console.log("Scanned QR URL:", scannedText);

      // QR 코드 데이터베이스와 비교
      if (qrcodesDB.includes(scannedText)) {
        setResult(prev => ({
          ...prev,
          date: new Date().toISOString(),
          qrcode: scannedText,
        }));
        setShowQR(false);  // QR 스캔 모달 닫기
        setNoti({ type: "success", message: "인증이 완료되었습니다" });
        setTimeout(() => {
          setNoti(null);
          startRoulette();  // 룰렛 시작
        }, 1000);
      } else {
        setNoti({ type: "error", message: "없는 정보입니다" });
        setShowQR(false);
      }
    } else {
      console.log("No QR code found");
    }
  };

  const handleSpinClick = () => {
    if (mustSpin || showQR) return;
    setShowQR(true);
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
    const resultData = {
      ...result,
      result: data[prizeNumber]?.option || "Unknown",
    };

    console.log("Result:", resultData);

    if (data[prizeNumber]?.option === "1등") {
      setShowGif(true);
      setTimeout(() => {
        setShowGif(false);
        setIsResultShow(true);
      }, 2000); // 2초간 GIF 표시 후 숨김
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
            outerBorderWidth={2}
            innerBorderWidth={2}
            radiusLineWidth={3}
            innerRadius={0}
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

        {/* GIF at the bottom */}
        <div style={{ position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%" }}>
          <img src="https://media.tenor.com/WUWygJ0Fwz8AAAAM/jago33-slot-machine.gif" alt="Slot Machine GIF" style={{ width: "150px" }} />
        </div>
      </div>

      {/* 유지해야 할 Modal 코드 추가 */}
      <Modal
        open={showQR}
        onClose={() => {
          setShowQR(false);
        }}
        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Box
          style={{
            width: "300px", // 가로 크기 조정
            height: "300px", // 세로 크기 조정
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          {cameraError ? (
            <div>{cameraError}</div>
          ) : (
            <QrReader
              onResult={handleScan}
              constraints={{ facingMode: 'environment' }}
              containerStyle={{ width: "100%", height: "100%" }}
              videoStyle={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
          <Button
            onClick={() => setShowQR(false)}
            style={{
              marginTop: "10px",
              position: "absolute",
              bottom: "10px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            닫기
          </Button>
        </Box>
      </Modal>

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
        onClose={() => {
          setIsResultShow(false);
        }}
        style={{ cursor: "pointer" }}
        onClick={() => {
          setIsResultShow(false);
        }}
      >
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            backgroundColor: "rgba(255, 255, 255, 0.9)", // 투명도 10% (0.9)
            width: "640px", // 크기 조정
            height: "360px", // 크기 조정
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

      <Snackbar
        open={!!noti}
        onClose={() => {
          setNoti(null);
        }}
        autoHideDuration={3000}
      >
        <Alert severity={noti?.type} variant="filled" sx={{ width: "100%" }}>
          {noti?.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default App;
