let scoreUrl = "http://cdn.55labs.com/demo/api.json";

function getData(url) {
    return new Promise(function(resolve, reject) {
        let req = new XMLHttpRequest();
        req.open('GET', url);
        req.onload = () => req.status == 200 ? resolve(req.response) : reject(Error('promise error with ' + req.status));
        req.onerror = (err) => reject(Error('Network Error with ' + url + ' : ' + err));
        req.send();
    });
}

getData(scoreUrl).then((result) => {
    createChart(JSON.parse(result));
    console.log("***************");
    console.log(result)
}).catch((err) => {
    alert('error - ' + err);
});

function createChart(result){
    let refactoredData = dataRefactoring(result);
    let playersIds = [];

    // Adding chart for each year
    for(let dataByYear of refactoredData.data){
        //adding titles
        document.getElementById("container").innerHTML += `
        <div class="title">  </div>
        `;
        let title = document.querySelector(".title");
        title.className += "year"+dataByYear.year;
        title.innerHTML += "Displaying players scores for year " + dataByYear.year;
        title.style.fontSize = "25px";

        // Adding chart for each month
        for(dataByMonth of dataByYear.data){
            document.getElementById("container").innerHTML += `
            <div id="chart-container" class="chart-container">
                <div class="y-axis-label">
                    <div>1000</div>
                    <div>800</div>
                    <div>600</div>
                    <div>400</div>
                    <div>200</div>
                    <div>0</div>
                </div>
                <div id="chart" class="chart">
                </div>
            </div>
            `;

            let chartContainer = document.getElementById("chart-container");
            chartContainer.id += "-"+dataByMonth.month+"-"+dataByYear.year;
            
            let chart = document.getElementById("chart");
            chart.id += "-"+dataByMonth.month+"-"+dataByYear.year;

            // Adding chart bar for each day
            for (let dataByDay of dataByMonth.dateAndPlayers){
                chart.innerHTML += `
                <div id="bar-wrapper" class="bar-wrapper">
                    <div id="bar-per-date" class="bar-per-date">
                    </div>
                </div>
                `;

                let barPerDate = document.getElementById("bar-per-date");
                barPerDate.id += "-"+dataByDay.date;

                let barWrapper = document.getElementById("bar-wrapper");
                barWrapper.id += "-"+dataByDay.date;

                // Adding bar for each player
                let playerNumber = 1;
                let index = 0;
                for(let scoreByPlayer of dataByDay.playersScore){
                    
                    document.getElementById(barPerDate.id).innerHTML += `
                    <div class="bar-container">
                        <div id="player-num" class="hide-div">
                        </div>
                        <div id="player" class="bar">
                        </div>
                    </div>
                    `;
                    let playerNumDiv =  document.getElementById("player-num");

                    playerNumDiv.id = "player-"+playerNumber+"-"+dataByDay.date+"-num";
                    
                    let playerScore;
                    for (let playerName in scoreByPlayer) {
                        playerScore = scoreByPlayer[playerName];
                    }
                    
                    playerNumDiv.innerHTML += playerScore;

                    let playerDiv =  document.getElementById("player");
                    playerDiv.id += "-"+playerNumber+"-"+dataByDay.date;
                    


                    let playerHeight = getHeight(playerScore);
                    playerDiv.style.height = playerHeight;
                    playerDiv.classList.add("player-"+playerNumber)

                    playersIds.push(playerDiv.id);

                    playerNumber++;
                }

                barWrapper.innerHTML += `
                    <div id="date">
                    </div>
                `;

                let dateDiv =  document.getElementById("date");
                dateDiv.id = dataByDay.date;
                dateDiv.innerHTML += dataByDay.date.substring(6,8);

            }

            chartContainer.innerHTML += `
                <div id="chart-info" class="chart-info">
                    <div id="month">
                    </div>
                    <div id="players-title">
                    </div>
                </div>
                `;
            
            let chartInfo = document.getElementById('chart-info');
            chartInfo.id += "-"+dataByMonth.month+"-"+dataByYear.year;

            let month = document.getElementById('month');
            month.id += "-"+dataByMonth.month+"-"+dataByYear.year;

            let playersTitle = document.getElementById('players-title');
            playersTitle.id += "-"+dataByMonth.month+"-"+dataByYear.year;

            month.innerHTML += "Month : "+dataByMonth.month;
            playersTitle.innerHTML += "Players :";

            let indexPlayer = 1;
            for(let player in refactoredData.settings.dictionary){
                chartInfo.innerHTML += `
                <div id="player-information" class="player-informations">
                    <div id="player-dot" class="dot">

                    </div>
                    <div id="player-name">
                        
                    </div>
                </div>
                `;

                let playerInformation = document.getElementById("player-information");
                playerInformation.id += "-"+player+"-"+dataByMonth.month+"-"+dataByYear.year;

                let playerDot = document.getElementById("player-dot");
                playerDot.id += "-"+player+"-"+dataByMonth.month+"-"+dataByYear.year;

                let playerName = document.getElementById("player-name");
                playerName.id += "-"+player+"-"+dataByMonth.month+"-"+dataByYear.year;

                playerDot.classList.add("player-"+indexPlayer);
                playerName.innerHTML += player;
                indexPlayer++;
            }

        }
    }

    for(let playerId of playersIds){
        addClickHandler(playerId);
    }

}

function dataRefactoring(result){
    let years = result?.data?.DAILY?.dates.map(
        (value) => value?.substring(0,4)
        ).filter((value, index, self) => self.indexOf(value) === index && value != null);
    
    let players = [];

    for (let player in result?.settings?.dictionary) {
        players.push(player);
    }

    let dataRefactored = [];

    let index = 0;
    let newIndex = 0;
    for(let year of years){
        index = newIndex;
        let resultPerYear = JSON.parse(JSON.stringify(result));

        resultPerYear.data.DAILY.dates = resultPerYear?.data?.DAILY?.dates.filter((value) => 
            value?.substring(0,4) === year
        );

        newIndex += resultPerYear?.data?.DAILY?.dates.length;
        for(let player of players){
            resultPerYear.data.DAILY.dataByMember.players[player].points = resultPerYear?.data?.DAILY?.dataByMember?.players[player]?.points.filter((value, indx)=>
                indx >= index && indx<=newIndex
            )
        }
        dataRefactored.push({
            "year": year,
            "data" : dataRefactoringByYear(resultPerYear)
        })   
    }

    let dataToBeReturned = {
        "data": dataRefactored,
        "settings": result?.settings 
    }
    return dataToBeReturned;
}

function dataRefactoringByYear(result) {
    let dataRefactored = [];

    let months = result?.data?.DAILY?.dates.map(
    (value) => value?.substring(4,6)
    ).filter((value, index, self) => self.indexOf(value) === index && value != null);
    
    let index = 0;
    for(let month of months){
        let dateOfCurrentMonth = result?.data?.DAILY?.dates.filter((value) => value === null || value.substring(4,6) === month);
        
        let players = result?.data?.DAILY?.dataByMember.players;

        let dateAndPlayers = getDateAndPlayers(dateOfCurrentMonth, players, index);

        dataRefactored.push({
            "month" : month,
            "dateAndPlayers": dateAndPlayers
        });

        index += dateOfCurrentMonth.length;
    }
    return dataRefactored;
}

function getDateAndPlayers(dateOfCurrentMonth, players, index){
    let localIndex = index;
    let dateAndPlayers = [];

    for(date of dateOfCurrentMonth){
        if(date != null){
            dateAndPlayers.push({
                "date": date,
                "playersScore" : getPlayerScoreByDate(localIndex, players)
            });
        }
        localIndex++;
    }
    return dateAndPlayers;
}

function getPlayerScoreByDate(index, players){
    let playerScore = [];

    for(let player in players){
        if(player != null){
            let obj = {};
            obj[player] = players[player].points[index];
            playerScore.push(obj)
        }
    }

    return playerScore;
}  

var clickTable = [];
function isToAddClass(barId) {
    let indexOfTheBar = clickTable.findIndex((value) => value.barId === barId);
    let isToAddClass;
    
    if (indexOfTheBar === -1){
        clickTable.push({
            "barId" : barId,
            "clicked" : false
        });
        indexOfTheBar = clickTable.findIndex((value) => value.barId === barId);
    } 

    if(clickTable[indexOfTheBar].clicked){
        isToAddClass = false;
    } else {
        isToAddClass = true;
    }
    clickTable[indexOfTheBar].clicked = !clickTable[indexOfTheBar].clicked;

    return isToAddClass;
}

function addClickHandler(barId){
    document.getElementById(barId).addEventListener('click', () => {
        if(isToAddClass(barId)){
            document.getElementById(barId).classList.add("clicked-bar");
            document.getElementById(barId+"-num").classList.remove("hide-div");
        } else {
            document.getElementById(barId).classList.remove("clicked-bar");
            document.getElementById(barId+"-num").classList.add("hide-div");
        }
    });
}

function getHeight(score){
    return ((score*200)/1000)+"px";
}

let dataModel = [];
dataModel.push({
    "month": "09",
    "dateAndPlayers": [
        {
            "date" : "20160901",
            "PlayersScore" : [
                {
                    "john" : 200,
                },
                {
                    "larry" : 300
                }
            ]
        },
        {
            "date" : "20160902",
            "playersScore" : [
                {
                    "john" : 600,
                },
                {
                    "larry" : 200
                }
            ]
        },
    ]
})