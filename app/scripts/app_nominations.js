flljudgingApp.controller('NominationsForm', function ($scope, $http, $window, ngDialog) {
	$scope.awards = [];
	$scope.selectJudgingPanel = null;
	$scope.judgingpanels = [];
	$scope.teams = [];
	$scope.teamsAll = [];
	$scope.teamsSorted = [];
	/*
		effect: determines the AngularJS list based on the HTML class name (teamlist/award0/award1/award2/overall);
		pre: (list == ui.item.sortable.droptarget[0]) || (list == event.sender);
	*/
	$scope.getSortableList = function(list) {
		var teamsSorted;
		// convert the award numbers that can be larger than 2 to numbers in the range 0..2.
		var awardsFiltered = $scope.awards.filter(function(award) {
			return award.category == $scope.rubricCategory;
		});
		if ($(list).hasClass('teamlist')) {
			teamsSorted = $scope.teams;
		}
		else if ($(list).hasClass('overall')) {
			teamsSorted = $scope.teamsSorted;
		}
		else {
			for (var i = 0; i < awardsFiltered.length; i++) {
				if ($(list).hasClass('award' + i)) {
					teamsSorted = awardsFiltered[i].teamsSorted;
				}
			}
		}
		return teamsSorted;
	}
	/*
		effect: removes the last team number matching with teamNumber from the array list;
	*/
	function removeFromList(list, teamNumber) {
		var found = -1;
		var i = 0;
		list.forEach(function(teamSorted) {
			if (teamSorted.number == teamNumber) {
				found = i;
			}
			i++;
		});
		if (found > -1) {
			list = list.splice(found, 1);
		}
		return list;
	}
	function existsTeam(list, teamNumber) {
		return list.some(function(teamSorted) {
			return teamSorted.number == teamNumber;
		});
	}
	$scope.sortableOptions = {
		// see: https://github.com/angular-ui/ui-sortable/
		// and http://angular-ui.github.io/ui-sortable/
		//helper: 'clone', // see: http://stackoverflow.com/questions/947195/jquery-ui-sortable-how-can-i-cancel-the-click-event-on-an-item-thats-dragged#answer-2977904
		connectWith: '.connectedItemsExample .list-group',
		update: function(event, ui) {
			if ($scope.teamsSorted == null){
//				$scope.teamsSorted = ['1'];
			} else {
//
			} 
			if (ui.item.sortable.droptarget != null) {
				var teamsSortedTarget = $scope.getSortableList(ui.item.sortable.droptarget[0]);
				//console.log(ui.item.sortable.sourceModel);
				//console.log(ui.item.sortable.droptargetModel);
				if (teamsSortedTarget == $scope.teams) {
					if (!ui.item.sortable.received) {
						// if the teamList is the target list, always cancel the drag-and-drop action and remove the source element.
						var teamsSortedSource = $scope.getSortableList(event.target);
						teamsSortedSource = removeFromList(teamsSortedSource, ui.item.sortable.model.number);
						ui.item.sortable.cancel();
					}/*
					if (ui.item.sortable.received) {
						// if the team number already exists in the teamList, remove the last one from the source list.
						teamsSortedTarget = removeFromList(teamsSortedTarget, ui.item.sortable.model.number);
					}*/
				}
				else if (!ui.item.sortable.received && (teamsSortedTarget != null)) {
					// if the team already exists in the target list, cancel the drag-and-drop action (but leave it in the source list).
					if (existsTeam(teamsSortedTarget, ui.item.sortable.model.number)) {
						ui.item.sortable.cancel();
					}
				}
			}
		},
		stop: function(event, ui) {
			if (ui.item.sortable.droptarget != null) {
				if ($(ui.item.sortable.droptarget[0]).hasClass('teamlist')) {
					// create spare copy of teamlist.
					$scope.teamsAll = $scope.teams.slice();
				}
				else {
					// clone teamlist from spare copy.
					$scope.teams = $scope.teamsAll.slice();
				}
			}
		}
	};
	$http({
		method: 'GET',
		url: '/fs/awards.json'
	}).success(function (result) {
		$scope.awards = result;
		$scope.awards.forEach(function(award) {
			award.teamsSorted = [];
		});
		var numAwards = $scope.awards.length;
		console.log(numAwards + " unfiltered awards successfully fetched!");
	});
	$http({
		method: 'GET',
		url: '/fs/judgingpanels.json'
	}).success(function (result) {
		$scope.judgingpanels = result;
		var numPanels = Object.keys($scope.judgingpanels).length;
		console.log(numPanels + " unfiltered judging panels successfully fetched!");
	});
	$http({	
		method: 'GET',		
		url: '/fs/teams.json'
	}).success(function (result) {
		$scope.teams = result;
		$scope.teamsAll = result.slice();
		var numTeams = Object.keys($scope.teams).length;
		console.log(numTeams + " teams successfully fetched!");
	});
	$scope.clearTeams = function() {
		this.teams = [];
		this.teamsAll = [];
	}
	$scope.clearRankings = function() {
		this.teamsSorted = [];
	}
	$scope.clearAwards = function() {
		this.awards.forEach(function(award) {
			award.teamsSorted = [];
		});
	}
	$scope.collectTeams = function(panel) {
		/*
		file specs:
			completed_rubrics\rubric_<category>_<team>.json
			.Category
			.Panel.panel
			.Team.number
		*/
		$http({
			method: 'GET',
			url: '/fs/completed_rubrics/'
		}).success(function(data) {
			var files = data.split("\n");
			files.forEach(function(filename) {
				$http({
					method: 'GET',
					url: '/fs/completed_rubrics/' + filename
				}).success(function(data) {
					if (data.Panel.panel == panel) {
						if (!existsTeam($scope.teams, data.Team.number)) {
							console.log(panel + " " + data.Team.number);
							$scope.teams.push(data.Team);
							$scope.teamsAll.push(data.Team);
						}
					}
				}).error(function() {
					console.log("Failed!");
					console.log("--------");
				});	
			});
		}).error(function() {
			console.log("Failed!");
			console.log("--------");
		});	
	}
	$scope.isTeamRanked = function(team) {
		var result = false;
		this.teamsSorted.forEach(function(sortedTeam) {
			if (sortedTeam.number == team.number) {
				result = true;
			}
		});
		return result;
	}
	$scope.areAllRanked = function() {
		return this.teamsSorted.length >= this.teams.length;
	}
	$scope.isPanelSelected = function() { 
		return this.selectJudgingPanel && this.selectJudgingPanel.panel;
	}
	$scope.ChangeForm = function() {
		if (this.selectJudgingPanel) {
			this.clearRankings();
			this.clearAwards();
			this.clearTeams();
			this.collectTeams(this.selectJudgingPanel.panel);
		}
	}
	$scope.TestForm = function(){
		this.teamsSorted = this.teams.slice();
		//this.clearAwards();
		console.log("Form Shuffled!");
	}
	$scope.ResetForm = function(){
		this.clearRankings();
		this.clearAwards();
		console.log("Form Reset!");
	}
	$scope.isSubmitEnabled = function() {
		return this.isPanelSelected() && this.areAllRanked();
	}
	function getRanking(teamsSorted) {
		var ranking = [];
		var i = 0;
		teamsSorted.forEach(function(teamSorted) {
			i++;
			ranking.push({
				"rank": i,
				"teamNumber": teamSorted.number,
				"teamName": teamSorted.name
			});
		});
		return ranking;
	}
	$scope.SubmitForm = function (){
		var filename = "nomination_" + this.selectJudgingPanel.panel.replace(" ", "") + "_" + Date.now();
		var rankings = [];
		rankings.push({
			"ranking": "overall",
			"ranks": getRanking(this.teamsSorted)
		});
		this.awards.forEach(function(award) {
			if (award.category === $scope.rubricCategory) {
				rankings.push({
					"ranking": award.award,
					"ranks": getRanking(award.teamsSorted)
				});
			}
		});
		$http({
			method: 'POST',
			url: '/fs/completed_nominations/' + filename + '.json',
			headers: { 'Content-Type': 'application/json; charset=UTF-8' },
			data: { 
				category: this.rubricCategory,
				panel: this.selectJudgingPanel.panel,
				rankings: rankings
			}
		}).success(function() {
			console.log("Saved!");
			console.log("--------");
			$window.alert('Thank you for submitting the ' + $scope.selectJudgingPanel.panel + ' panel nominations.');
			$scope.ResetForm();
		}).error(function() {
			console.log("Failed!");
			console.log("--------");
		});	
	}
	$scope.AwardSelection = function (team, category){
		ngDialog.open({ 
			template: 'pages/dialogSelectAward.html', 
			data:{
				team:team, 
				awardArray:this.awards,
				scope:this,
				category:category
			}
		});
	}
	$scope.isAwardTeam = function(award, team) {
		return existsTeam(award.teamsSorted, team.number);
	}
	$scope.NominateForAward = function (award, team){
		if (!existsTeam(award.teamsSorted, team.number)) {
			award.teamsSorted.push(team);
		}
		ngDialog.close();
	}
	$scope.NominateForRanking = function (team){
		this.teamsSorted.push(team);
		ngDialog.close();
	}
	$scope.BringDown = function (award, team){
		var ida = award.teamsSorted.indexOf(team);
		var idb = ida + 1;
		var teama = award.teamsSorted[ida];
		var teamb = award.teamsSorted[idb];
		award.teamsSorted[ida] = teamb;
		award.teamsSorted[idb] = teama;
	}
	$scope.BringUp = function (award, team){
		var ida = award.teamsSorted.indexOf(team);
		var idb = ida - 1;
		var teama = award.teamsSorted[ida];
		var teamb = award.teamsSorted[idb];
		award.teamsSorted[ida] = teamb;
		award.teamsSorted[idb] = teama;
	}
	$scope.BringDownR = function (team){
		var ida = this.teamsSorted.indexOf(team);
		var idb = ida + 1;
		var teama = this.teamsSorted[ida];
		var teamb = this.teamsSorted[idb];
		this.teamsSorted[ida] = teamb;
		this.teamsSorted[idb] = teama;
	}
	$scope.BringUpR = function (team){
		var ida = this.teamsSorted.indexOf(team);
		var idb = ida - 1;
		var teama = this.teamsSorted[ida];
		var teamb = this.teamsSorted[idb];
		this.teamsSorted[ida] = teamb;
		this.teamsSorted[idb] = teama;
	}
});