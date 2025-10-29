This application is an helper tool for ESPN NBA fantasy leagues. On the main branch, it is set on a specific league with auction draft and dynasty mode.

## Index

On the index page, all teams are listed. When clicking a team, the user can see the list of its players with the following informations : name, last season player rater, current season player rater, current streak of keeps between seasons, current salary, estimated salary for next season. It can aalso select potential keepers for next season to see how much total salary it would cost.

## Trade

The trade page allow the user to test trade scenario and check if it would fit in the salary restrictions : teams can not go higher than $220 during season.

## Teams

The teams page is a table with summed up data for each team : salaries, current margin under salary cap ($220), total player rater of its current roster based on last season raters and total player rater of its current roster based on current season raters.

## Injuries

The injuries page list the players with injuries long enough to be banned from being picked as a free agent.

## Advanced

The advanced page compute advanced statistics for all players based on salaries, raters and games played.

## History

The history page ranks managers based on all previous seasons success.

## Rules

The rules page explains all the specific rules of this fantasy league.

## Stored data

- the data is stored in json fils in the src/assets folder. The src/assets/history/history.json file stores data for the history page, the src/assets/rater folder stores json files for each past season players rater, the src/assets/teams/rosters.json file stores both the injured players for the injuries page but mainly all the current rosters of the fantasy league with all the data for each player.

## Scripts

- the src/scripts/dailyUpdate.ts file is a script that needs to be manually launched every day to update the fantasy league rosters, tracking potential rosters moves (trades, free agents picks...).
