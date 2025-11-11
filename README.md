This application is an helper tool for ESPN NBA fantasy leagues. On the main branch, it is set on a specific league with auction draft and dynasty mode.

## Index

On the index page, all teams are listed. When clicking a team, the user can see the list of its players with the following informations : name, last season player rater, current season player rater, current streak of keeps between seasons, current salary, estimated salary for next season. It can also select potential keepers for next season to see how much total salary it would cost.

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

## Data Storage

The application uses a Supabase PostgreSQL database to store all fantasy league data. The database schema is defined in `database/schemas.sql` and includes the following tables:

- **teams**: Fantasy league teams with their names and abbreviations
- **players**: All players with their team assignments, salaries, and game statistics
- **keeper_history**: Historical record of which players were kept across seasons
- **player_stats**: Detailed basketball statistics for each player (FGA, FGM, rebounds, assists, etc.)
- **player_raters**: Season-specific player rating metrics for performance evaluation

## Data Updates

The database is automatically updated daily through GitHub Actions, which runs the `scripts/updateDatabase.ts` script. This script:

1. Fetches current data from the Supabase database
2. Retrieves fresh roster and statistics data from the ESPN Fantasy API
3. Processes roster changes (trades, free agent pickups, drops)
4. Updates player statistics and ratings for the current season
5. Maintains historical data (previous season ratings remain unchanged)
6. Tracks unpickable players (injured players banned from free agent pickups)

The automation ensures that the application always displays up-to-date fantasy league information without manual intervention.
