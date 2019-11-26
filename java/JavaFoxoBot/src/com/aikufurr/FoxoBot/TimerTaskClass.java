package com.aikufurr.FoxoBot;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.UnsupportedEncodingException;
import java.util.Calendar;
import java.util.Date;
import java.util.TimerTask;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.simple.JSONObject;
import org.json.simple.parser.ParseException;

import net.dv8tion.jda.api.entities.Guild;

public class TimerTaskClass extends TimerTask {
    public static Commands cmd = new Commands();

    @SuppressWarnings("unchecked")
    public void run() {
        for (Guild guild : FoxoBot.jda.getGuilds()) {
            try {
                JSONObject guildData = cmd.getGuildData(guild);

                JSONObject remindMe = (JSONObject) guildData.get("remindMe");

                remindMe.forEach((key, value) -> {
                    try {
                        JSONArray remindMeUser = new JSONArray(remindMe.get(key).toString());
                        //System.out.println(remindMeUser.toString());
                        for (int i = 0; i < remindMeUser.length(); i++) {
                            JSONArray subArray = new JSONArray(remindMeUser.get(i).toString());
                            Calendar cal = Calendar.getInstance();
                            cal.setTime(new Date());
                            if (Long.parseLong(subArray.get(0).toString()) < cal.getTimeInMillis()) {
                                FoxoBot.jda.getUserById(key.toString()).openPrivateChannel().queue(channel -> {
                                    try {
                                        channel.sendMessage("Your reminder: `" + subArray.get(1).toString() + "`").queue();
                                    } catch (JSONException e) {
                                        // TODO Auto-generated catch block
                                        e.printStackTrace();
                                    }
                                });
                                remindMeUser.remove(i);
                                remindMe.put(key.toString(), remindMeUser);
                                guildData.put("remindMe", remindMe);
                                PrintWriter writer = new PrintWriter("guildData/" + guild.getId() + ".json", "UTF-8");
                                writer.println(guildData.toString());
                                writer.close();
                            }
                        }
                    } catch (JSONException | FileNotFoundException | UnsupportedEncodingException e) {
                        // TODO Auto-generated catch block
                        e.printStackTrace();
                    }
                });

                // ArrayList<String> list = new ArrayList<String>(map.keySet());

//                JSONArray remindMeOGArray = new JSONArray(
//                        remindMe.get(event.getAuthor().getId()).toString());
//                String items = "";
//                for (int i = 0; i < remindMeOGArray.length(); i++) {
//                    JSONArray subArray = new JSONArray(remindMeOGArray.get(i).toString());
//                    Calendar cal = Calendar.getInstance();
//                    cal.setTimeInMillis(Long.parseLong(subArray.get(0).toString()));
//                    items += "`" + subArray.get(1).toString() + "` at `" + cal.getTime() + "`" + "\n";
//                }

            } catch (JSONException | IOException | ParseException e) {
                // TODO Auto-generated catch block
                e.printStackTrace();
            }

        }
    }
}
