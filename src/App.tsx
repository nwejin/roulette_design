import React, { useState } from "react";
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
import "./App.css";

const StartButton = styled(Button)<ButtonProps>(({ theme }) => ({
  marginTop: "20px",
  width: "100%",
  fontSize: 20,
  color: "#fff",
  backgroundColor: red[500],
  padding: "15px",
  borderRadius: "10px",
  "&:hover": {
    backgroundColor: red[700],
    color: "#fff",
  },
}));

const data = [
  {
    option: "1등",
    style: { backgroundColor: "#FFB6C1", textColor: "black" },
    probability: 3,
    imageUrl: "https://cdn.funshop.co.kr//products/0000294741/vs_image800.jpg?1725245400"
  },
  {
    option: "2등",
    style: { backgroundColor: "#ADD8E6", textColor: "black" },
    probability: 7,
    imageUrl: "https://cdn.funshop.co.kr//products/0000262710/vs_image800.jpg?1725245520"
  },
  {
    option: "3등",
    style: { backgroundColor: "#90EE90", textColor: "black" },
    probability: 15,
    imageUrl: "https://cdn.funshop.co.kr//products/0000204053/vs_image800.jpg?1725245580"
  },
  {
    option: "4등",
    style: { backgroundColor: "#FFFACD", textColor: "black" },
    probability: 25,
    imageUrl: "https://cdn.funshop.co.kr//products/0000281263/vs_image800.jpg?1725245640"
  },
  {
    option: "꽝",
    style: { backgroundColor: "#D3D3D3", textColor: "black" },
    probability: 50,
    imageUrl: ""
  },
];

function App() {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [isResultShow, setIsResultShow] = useState<boolean>(false);
  const [noti, setNoti] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSpinClick = () => {
    if (mustSpin) return;

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

    console.log('Result:', resultData);  // 파일 저장 대신 콘솔에 출력
  };

  return (
    <>
      <div className="roulette-layout">
        <div style={{ textAlign: "center" }}>
          <h1>룰렛</h1>
          <Wheel
            mustStartSpinning={mustSpin}
            data={data}
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
        open={isResultShow}
        onClose={() => {
          setIsResultShow(false);
        }}
        style={{}}
      >
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            textAlign: "center",
            flexDirection: "column",
            backgroundColor: "white",
            width: "45%",
            height: "40%",
            maxWidth: "100vw",
            maxHeight: "100%",
            position: "fixed",
            top: "50%",
            left: "30%",
            transform: "translate(0, -50%)",
            overflowY: "auto",
          }}
        >
          <CloseIcon
            aria-label="close"
            onClick={() => {
              setIsResultShow(false);
            }}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          />
          <span style={{ fontSize: "60px" }}>
            {data[prizeNumber] ? data[prizeNumber].option : ""}
          </span>
          {data[prizeNumber].imageUrl && (
            <img
              src={data[prizeNumber].imageUrl}
              alt={data[prizeNumber].option}
              style={{
                marginTop: "20px",
                maxWidth: "100%",
                maxHeight: "200px",
                objectFit: "contain",
              }}
            />
          )}
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
