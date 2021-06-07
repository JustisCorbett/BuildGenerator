async function getChampData () {
    let response = await fetch ("http://ddragon.leagueoflegends.com/cdn/11.11.1/data/en_US/champion.json");
    if (response.ok) {
        const champData = await response.json();
        return champData.data;
    } else {
        alert("Could not get champion data. Refresh to try again.");
    }
}

function getChampArt (champ) {
    let imageLink = "http://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + champ.id + "_0.jpg";
    splash = document.getElementById("champ-splash");
    splash.src = imageLink;
    console.log(imageLink);
}

function setChampData (champ) {
    let champNameEl = document.getElementById("champion-name");
    let champTitleEl = document.getElementById("champion-title");
    champNameEl.textContent = champ.name;
    champTitleEl.textContent = champ.title;
}

function randChamp () {
    getChampData().then(champData => {
        let rand = (Math.floor(Math.random() * Object.keys(champData).length));
        let champArray = Object.values(champData);
        let champ = champArray[rand];
        console.log(champ);
        getChampArt(champ);
        setChampData(champ);
    });
}

window.onload = () => {
    randChamp();
}