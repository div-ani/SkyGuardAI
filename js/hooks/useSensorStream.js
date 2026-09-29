/* useSensorStream – owns the live data and the pause/resume switch.
   Returns: { data, isLive, setIsLive, injectSpike, injectStuck } */
SkyGuard.useSensorStream = function () {
  const { useState, useEffect, useRef } = React;

  const [data, setData] = useState(SkyGuard.createInitialData);
  const [isLive, setIsLive] = useState(true);

  const latestData = useRef(data);                 // always the newest data
  const step = useRef(SkyGuard.CONFIG.HISTORY_LENGTH);  // keeps the sine wave moving
  const faults = useRef(SkyGuard.createFaultState());

  // Every TICK_MS add one reading per sensor
  useEffect(() => {
    if (!isLive) return undefined;
    const timer = setInterval(() => {
      step.current += 1;
      latestData.current = SkyGuard.advanceData(latestData.current, step.current, faults.current);
      setData(latestData.current);
    }, SkyGuard.CONFIG.TICK_MS);
    return () => clearInterval(timer);
  }, [isLive]);

  const injectSpike = (stationId, sensor) => {
    SkyGuard.queueSpike(faults.current, stationId, sensor);
    setIsLive(true);
  };
  const injectStuck = (stationId, sensor) => {
    SkyGuard.queueStuck(faults.current, stationId, sensor);
    setIsLive(true);
  };

  return { data, isLive, setIsLive, injectSpike, injectStuck };
};
