/*

    IGNORE
    socket.on("new-listener", (data) => {
      console.log(data, " listening to new-listener ");
      setViewers((prevViewers) => {
        // Check if the new listener is already in the prevViewers array
        const isExisting = prevViewers.some(
          (viewer) => viewer.name === data.name
        );
        // Only add the new listener if they are not already in the array
        if (!isExisting) {
          return prevViewers.concat(data);
        } else {
          return prevViewers;
        }
      });
    });
    
    */


    /*
  useEffect(() => {
    axios
      .post(
        `${
          import.meta.env.VITE_ENV === "development"
            ? import.meta.env.VITE_API_DEV + "/rooms/getParticipants"
            : import.meta.env.VITE_API_PROD + "/rooms/getParticipants"
        }`,
        { roomID },
        { withCredentials: true }
      )
      .then((response) => {
        console.log(
          `${JSON.stringify(response.data)} --- from /rooms/getParticipants `
        );

        setHostInfo(response.data.host);
        setViewers(response.data.allListeners && response.data.allListeners);
      })
      .catch((error) => {
        console.log(`${error} -- happened while fetching allListeners`);
      });
  }, []);*/