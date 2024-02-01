Feature: Cycle Starts

Scenario Outline: Next Level
  Given performance goals "tier" is set to "<current_level>"
  When performance goals "cycle_post_count" is set to "<posts>"
  And performance goals "cycle_share_count" is set to "<shares>"
  And canvas "collabs-daily-card-cycle" is triggered
  Then performance goals "cycle_post_count" must equal "<posts>"
  Then performance goals "cycle_share_count" must equal "<shares>"
    
    Examples:
      | current_level | posts | shares | next_level |
      | 1             | 3     | 2      | 1          |
