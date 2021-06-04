async function getChampData () {
    let response = await fetch ("http://ddragon.leagueoflegends.com/cdn/11.11.1/data/en_US/champion.json");
    if (response.ok) {
        const champData = await response.json();
        return champData.data;
    } else {
        alert("Could not get champion data. Refresh to try again.");
    }
}

async function getChampArt (champ) {
    imageName = champ.image.full;
    let response = await fetch ("http://ddragon.leagueoflegends.com/cdn/img/champion/splash/" + imageName);
    if (response.ok) {
        let image = await response.blob();
    } else {
        alert("Could not load champion image. Refresh to try again.")
    }
    console.log(image);
}


function randChamp () {
    getChampData().then(champData => {
        let rand = (Math.floor(Math.random() * Object.keys(champData).length));
        let champArray = Object.values(champData);
        let champ = champArray[rand];
        console.log(champ);
        getChampArt(champ);
    });
}

window.onload = () => {
    randChamp();
}