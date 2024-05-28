document.addEventListener('DOMContentLoaded', () => {
  const serverStatus = document.getElementById('server-status');
  const service = document.getElementById('service');
  const startTimeElement = document.getElementById('start-time');
  const elapsedTimeElement = document.getElementById('elapsed-time');

  function updateServerStatus(status) {
    serverStatus.className = 'server-status';
    if (status) {
      serverStatus.classList.add('green');
    } else {
      serverStatus.classList.add('red');
    }
  }

  function formatTime(utcTimeString) {
    const utcTime = new Date(utcTimeString);
    const localTime = new Date(utcTime);
    return localTime
      .toLocaleString()
      .slice(0, 17)
      .replace(',', ' | ')
      .replace('.', '/')
      .replace('.', '/');
  }

  function convertSeconds(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours} saat, ${minutes} dəqiqə, ${remainingSeconds} saniyə`;
  }

  async function getTime() {
    try {
      serverStatus.className = 'server-status server-status--yellow';
      const response = await axios.get('/users/time');
      console.log(response);
      const { startTime, elapsedTime } = response.data;

      if (response.data) {
        updateServerStatus(true);
        service.textContent = 'server işləyir 😊';

        if (startTime) {
          const formattedTime = formatTime(startTime);
          startTimeElement.innerText = formattedTime;
        }

        if (elapsedTime !== undefined) {
          elapsedTimeElement.innerText = convertSeconds(elapsedTime);
        } else {
          elapsedTimeElement.innerText = 'işləmir';
        }
      } else {
        service.textContent = 'server işləmir 😞';
        elapsedTimeElement.innerText = 'server işləmir 😞';
        updateServerStatus(false);
      }
    } catch (error) {
      console.log('Ошибка при получении времени старта сервера:', error);
      service.textContent = 'server işləmir 😞';
      updateServerStatus(false);
    }
  }

  setInterval(getTime, 2000);
  setInterval(() => location.reload(), 60000);
});
