function getChampData () {
    let response = fetch ("http://ddragon.leagueoflegends.com/cdn/11.11.1/data/en_US/champion.json");

    if (response.ok) {
        let json = await response.json;
    } else {
        alert("Could not get champion data.");
    }
}