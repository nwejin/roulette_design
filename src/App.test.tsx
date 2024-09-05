import React, { useState, useEffect, useRef } from "react";
import axios from "axios"; // axios 추가
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

// 상품 재고 수량 및 QR코드 데이터는 서버에서 관리
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

// 초기 상태로 빈 배열 설정
const data: PrizeData[] = [
  { option: "", style: { backgroundColor: "", textColor: "" }, probability: 0, imageUrl: "" }
];

const StartButton = styled(Button)<ButtonProps>(({ theme }) => ({
  marginTop: "20px",
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
  const [lastGameTime, setLastGameTime] = useState<number | null>(null); // 최근 게임 시간 기록
  const [inventory, setInventory] = useState({
    first: 0,
    second: 0,
    third: 0,
    fourth: 0,
  }); // 상품 재고 관리
  const [prizeData, setPrizeData] = useState<PrizeData[]>([]); // 서버에서 받아올 상품 데이터

  const currentAudio = useRef<HTMLAudioElement | null>(null); // 현재 재생 중인 오디오 트래킹

  // SSL 검증을 무시하는 axios 인스턴스 생성
  const axiosInstance = axios.create({
    baseURL: "https://18.188.19.234:443",  // 서버 주소
    headers: {
      'Content-Type': 'application/json',
    },
    httpsAgent: new (require('https')).Agent({  
      rejectUnauthorized: false  // SSL 검증을 무시합니다.
    })
  });
  
  useEffect(() => {
    // 서버에서 상품 재고 및 상품 데이터 불러오기
    axiosInstance
      .get("/api/inventory")
      .then((response) => {
        setInventory(response.data); // 상품 재고 데이터 설정
        setPrizeData([
          {
            option: "1등",
            style: { backgroundColor: "#FFB6C1", textColor: "black" },
            probability: response.data.first > 0 ? 3 : 0,
            imageUrl:
              "https://cdn.funshop.co.kr//products/0000294741/vs_image800.jpg?1725245400",
          },
          {
            option: "2등",
            style: { backgroundColor: "#ADD8E6", textColor: "black" },
            probability: response.data.second > 0 ? 7 : 0,
            imageUrl:
              "https://cdn.funshop.co.kr//products/0000262710/vs_image800.jpg?1725245520",
          },
          {
            option: "3등",
            style: { backgroundColor: "#90EE90", textColor: "black" },
            probability: response.data.third > 0 ? 15 : 0,
            imageUrl:
              "https://cdn.funshop.co.kr//products/0000204053/vs_image800.jpg?1725245580",
          },
          {
            option: "4등",
            style: { backgroundColor: "#FFFACD", textColor: "black" },
            probability: response.data.fourth > 0 ? 25 : 0,
            imageUrl:
              "https://cdn.funshop.co.kr//products/0000281263/vs_image800.jpg?1725245640",
          },
          {
            option: "꽝",
            style: { backgroundColor: "#D3D3D3", textColor: "black" },
            probability: 50,
            imageUrl: "",
          },
        ]); // 서버에서 받은 데이터를 prizeData에 저장
      })
      .catch((error) => {
        console.error("상품 데이터를 불러오는데 오류가 발생했습니다.", error);
      });
  }, []);

  const stopCurrentAudio = () => {
    if (currentAudio.current) {
      currentAudio.current.pause();
      currentAudio.current.currentTime = 0;
    }
  };

  const playAudio = (filePath: string, onEndedCallback?: () => void, interruptible: boolean = true) => {
    // 특정 파일(예: 룰렛 소리)은 중단되지 않도록 처리
    if (interruptible) {
      stopCurrentAudio(); // 새로운 오디오가 시작되면 기존 오디오 중지
    }

    try {
      const audio = new Audio(filePath);
      currentAudio.current = audio; // 현재 재생 중인 오디오 업데이트
      if (onEndedCallback) {
        audio.onended = onEndedCallback;
      }
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    } catch (error) {
      console.log("Audio file not found or could not be played:", filePath);
    }
  };

  const handleScan = (result: any) => {
    if (result) {
      const scannedText = result.text;
      setUser(scannedText);

      // QR 코드 검증을 서버에 요청
      axiosInstance
        .post("/api/validateQR", { qrcode: scannedText })
        .then((response) => {
          if (response.data.success) {
            setResult((prev) => ({
              ...prev,
              date: new Date().toISOString(),
              qrcode: scannedText,
            }));
            setShowQR(false);
            playAudio("/asset/verify.mp3"); // QR 인증 성공 시 음성 재생
            handleAuthenticationSuccess();
          } else {
            playAudio("/asset/retry.mp3"); // 불일치 피드백
            setNoti({ type: "error", message: response.data.message });
            setShowQR(false);
          }
        })
        .catch((error) => {
          console.error("QR 검증 오류: ", error);
          setNoti({ type: "error", message: "QR 검증 중 오류가 발생했습니다." });
          setShowQR(false);
        });
    } else if (result === null) {
      console.log("No QR code found");
    } else if (result instanceof Error) {
      console.error("QR Reader error:", result);
      setCameraError(`QR 스캐너 오류: ${result.message}`);
      setShowQR(false);
    }
  };

  // 최근 5분 내에 게임이 시작되었는지 체크하는 함수
  const isRecentGameStarted = () => {
    if (!lastGameTime) return false;
    const now = Date.now();
    const fiveMinutesInMillis = 5 * 60 * 1000;
    return now - lastGameTime < fiveMinutesInMillis;
  };

  const startSpeechRecognition = () => {
    if (isRecentGameStarted()) {
      console.log("최근 5분 내에 게임이 시작되었습니다. 음성 인식을 생략합니다.");
      handleSpinClick();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript.trim();
      if (speechResult.includes("게임시작") || speechResult.includes("시작")) {
        playAudio("/asset/intro.mp3");
        handleSpinClick();
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      playAudio("/asset/intro.mp3");
      handleSpinClick();
    };

    recognition.start();
  };

  const handleSpinClick = () => {
    if (mustSpin || showQR) return;
    setShowQR(true);
  };

  const handleAuthenticationSuccess = () => {
    setNoti({ type: "success", message: "인증이 완료되었습니다" });
    setTimeout(() => {
      setNoti(null);
      startRoulette();
    }, 1000);
  };

  const startRoulette = () => {
    const probabilities = prizeData.map((item) => item.probability);
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
    playAudio("/asset/wheel.mp3", undefined, false);
    setMustSpin(true);
    setLastGameTime(Date.now());
  };

  const saveResult = () => {
    const resultData = {
      ...result,
      result: prizeData[prizeNumber]?.option || "Unknown",
    };

    // 결과 서버에 저장
    axiosInstance
      .post("/api/result", { result: resultData })
      .then(() => {
        console.log("결과가 성공적으로 저장되었습니다.");
      })
      .catch((error) => {
        console.error("결과 저장 중 오류가 발생했습니다.", error);
      });

    // 당첨에 따른 음성 재생
    const prizeOption = prizeData[prizeNumber]?.option;
    if (prizeOption) {
      if (prizeOption === "꽝") {
        playAudio("/asset/fail1.mp3", () => playAudio("/asset/fail.mp3"));
      } else {
        playAudio("/asset/win1.mp3", () => playAudio("/asset/win.mp3"));
      }
    }

    if (prizeOption === "1등") {
      setShowGif(true);
      setTimeout(() => {
        setShowGif(false);
        setIsResultShow(true);
      }, 2000);
    } else {
      setIsResultShow(true);
    }
  };

    const getResultMessage = () => {
      if (!prizeData[prizeNumber]) return '';  // 조건 추가
    
      switch (prizeData[prizeNumber].option) {
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
        <div style={{ textAlign: "center" }}>
          <h1>룰렛</h1>
          <Wheel
            mustStartSpinning={mustSpin}
            data={prizeData.map((item) => ({
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
            backgroundColors={prizeData.map((item) => item.style.backgroundColor)}
            textColors={prizeData.map((item) => item.style.textColor)}
          />
          <StartButton variant="outlined" size="large" onClick={startSpeechRecognition}>
            Start
          </StartButton>
        </div>
      </div>

      <Modal
        open={showQR}
        onClose={() => {
          setShowQR(false);
        }}
        style={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Box
          style={{
            width: "300px",
            height: "300px",
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
              constraints={{ facingMode: "environment" }}
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
        <Modal open={true} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
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
          {prizeData[prizeNumber] && prizeData[prizeNumber].imageUrl && (
            <img
              src={prizeData[prizeNumber].imageUrl}
              alt={prizeData[prizeNumber].option}
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
