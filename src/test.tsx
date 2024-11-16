import React, { useState } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles((theme: any) => ({
  wrap: {
    width: '100vw',
    height: '100vh',
    paddingTop: 80,
    backgroundColor: '#0080f1',
  },
  contents: {
    width: '100%',
    padding: '16px 24px 0',
    color: '#333',
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  rouletteOuter: {
    position: 'relative',
    marginTop: 38,
    width: '95%',
    maxWidth: '50rem',
    minWidth: '20rem',
    // border: '1rem dotted #333',
    borderRadius: '50%',
    backgroundColor: 'pink',
    boxShadow: '0px 12px 20px rgba(0, 0, 0, 0.25)',
    aspectRatio: '1/1',
  },
  roulette: {
    position: 'absolute',
    overflow: 'hidden',
    top: '3%',
    left: '3%',
    right: '3%',
    bottom: '3%',
    borderRadius: '50%',
    border: '4px solid #B1C8DE',
    transformOrigin: 'center',
    transitionTimingFunction: 'ease-in-out',
  },
  item: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: '10px',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    fontSize: '10px',
    '&:nth-child(1)': {
      background: 'conic-gradient(from 337.5deg, #E7EFF3 45deg, #ffffff 45deg)',
    },
  },
  line: {
    position: 'absolute',
    top: 0,
    bottom: '50%',
    left: '50%',
    width: '4px',
    marginLeft: '-2px',
    background: '#B1C8DE',
    transformOrigin: 'bottom',
  },
  rouletteOuterBtn: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 150,
    height: 150,
    borderRadius: '50%',
    backgroundColor: '#FFDB00',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rouletteBtn: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    backgroundColor: '#0080F1',
    border: 'none',
    color: '#fff',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  on: {
    animationName: '$ani',
    animationDuration: '4s',
    animationFillMode: 'forwards',
  },
  '@keyframes ani': {
    from: {
      transform: 'rotate(0deg)',
    },
    to: {
      transform: 'rotate(1440deg)', // 4회전 후 멈춤
    },
  },
  dots: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    // // borderRadius: '50%',
    // backgroundColor: 'red',
    pointerEvents: 'none', // 도트가 클릭되지 않도록 설정
  },
  dot: {
    position: 'absolute',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
  },
}));

export default function Test() {
  const classes = useStyles();
  const [spinning, setSpinning] = useState(false);

  const prizeData = ['Prize 1', 'Prize 2', 'Prize 3', 'Prize 4', 'Prize 5', 'Prize 6', 'Prize 7', 'Prize 8'];

  const handleClick = () => {
    setSpinning(true);
    setTimeout(() => {
      setSpinning(false);
    }, 4000);
  };

  const dotCount = 36; // 도트 개수
  const radius = 370; // 도트의 원형 반지

  return (
    <div className={classes.wrap}>
      <div className={classes.contents}>
        <div className={classes.rouletteOuter}>
          <div className={classes.dots}>
            {Array.from({ length: dotCount }).map((_, index) => {
              const angle = (index * 360) / dotCount;
              const x = radius * Math.cos((angle * Math.PI) / 180);
              const y = radius * Math.sin((angle * Math.PI) / 180);
              return (
                <div
                  key={index}
                  className={classes.dot}
                  style={{
                    top: `calc(50% + ${y}px)`,
                    left: `calc(50% + ${x}px)`,
                  }}
                />
              );
            })}
          </div>
          {/* <div className={clsx(classes.roulette, spinning && classes.on)}>
            {prizeData.map((item, index) => (
              <div key={index} className={classes.item} style={{ transform: `rotate(${index * 45}deg)` }}>
                <p>{item}</p>
              </div>
            ))}
            {prizeData.map((_, index) => (
              <div
                key={index}
                className={classes.line}
                style={{
                  transform: `rotate(${index * 45 - 22.5}deg)`,
                }}
              />
            ))}
          </div> */}
          <div className={classes.rouletteOuterBtn}>
            <button className={classes.rouletteBtn} onClick={handleClick} disabled={spinning}>
              도전
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
