import React, { useState, useEffect } from "react";
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
import CloseIcon from "@mui/icons-material/Close";
import { QrReader } from "react-qr-reader";
import "./App.css";

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

const data = [
  // data definition remains the same
];

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

  useEffect(() => {
    async function checkCameraPermission() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        console.log("Camera permission granted");
      } catch (err) {
        console.error("Camera permission error:", err);
        setCameraError("카메라 권한을 허용해주세요.");
      }
    }
    checkCameraPermission();
  }, []);

  const handleScan = (result: any) => {
    if (result) {
      const scannedText = result.text;
      setUser(scannedText);
      console.log("Scanned QR URL:", scannedText);
      setShowQR(false);
      handleAuthenticationSuccess();
    } else if (result === null) {
      // QR 코드를 찾지 못했을 때의 처리
      console.log("No QR code found");
    } else if (result instanceof Error) {
      // 에러 발생 시 처리
      console.error("QR Reader error:", result);
      setCameraError(`QR 스캐너 오류: ${result.message}`);
      setShowQR(false);
    }
  };

  const handleSpinClick = () => {
    if (mustSpin || showQR) return;
    setShowQR(true);
    setTimeout(() => {
      if (showQR) {
        setShowQR(false);
      }
    }, 30000);
  };

  const handleAuthenticationSuccess = () => {
    setNoti({ type: "success", message: "인증이 완료되었습니다" });
    setTimeout(() => {
      setNoti(null);
      startRoulette();
    }, 1000);
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
      date: new Date().toISOString(),
      result: data[prizeNumber]?.option || "Unknown",
    };

    console.log("Result:", resultData);
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
        <div style={{ textAlign: "center" }}>
          <h1>룰렛</h1>
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
              setIsResultShow(true);
              saveResult();
            }}
            spinDuration={1}
            backgroundColors={data.map((item) => item.style.backgroundColor)}
            textColors={data.map((item) => item.style.textColor)}
          />
          <StartButton
            variant="outlined"
            size="large"
            onClick={handleSpinClick}
          >
            시작
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
            width: "80%",
            height: "80%",
            backgroundColor: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            position: "relative", // Ensure children are positioned relative to this container
          }}
        >
          {cameraError ? (
            <div>{cameraError}</div>
          ) : (
            <QrReader
              onResult={handleScan}
              constraints={{ facingMode: 'environment' }}
              containerStyle={{ width: "100%", height: "100%" }} // Full width and height
              videoStyle={{
                width: "100%",
                height: "100%",
                objectFit: "cover", // Ensure video covers container
              }}
            />
          )}
          <Button
            onClick={() => setShowQR(false)}
            style={{
              marginTop: "10px",
              position: "absolute",
              bottom: "10px", // Position button at the bottom
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            닫기
          </Button>
        </Box>
      </Modal>

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
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            width: "70%",
            height: "70%",
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
