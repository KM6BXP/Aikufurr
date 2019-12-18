package com.aikufurr.FoxoBot;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.events.message.guild.GuildMessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;


public class GuildMemberLeave extends ListenerAdapter {

    @SuppressWarnings("unchecked")
    public JSONObject getGuildData(Guild guild) throws JSONException, IOException, ParseException {
        JSONObject guildItems;

        File f2 = new File("guildData");
        if (!f2.exists()) {
            Files.createDirectories(Paths.get("guildData"));
        }

        File f = new File("guildData/" + guild.getId() + ".json");
        if (f.exists() && !f.isDirectory()) {
            JSONParser parser = new JSONParser();
            Path pathStr = Paths.get("guildData/" + guild.getId() + ".json");
            String content = Files.readString(pathStr);
            Object obj = parser.parse(content.toString());
            guildItems = (JSONObject) obj;
        } else {
            guildItems = new JSONObject();
        }

        JSONObject ranks = new JSONObject();
        JSONObject remindMe = new JSONObject();
        JSONArray toggledCommands = new JSONArray();
        guildItems.putIfAbsent("guildNameAtTime", guild.getName());
        guildItems.putIfAbsent("prefix", "-");
        guildItems.putIfAbsent("ranks", ranks);
        guildItems.putIfAbsent("welcomeMessageEnabled", 1);
        guildItems.putIfAbsent("welcomeMessage", "Welcome {member} to {guild}!");
        guildItems.putIfAbsent("toggledCommands", toggledCommands);
        guildItems.putIfAbsent("spamFilterEnabled", 0);
        guildItems.putIfAbsent("spamFilterCooldown", 3);
        guildItems.putIfAbsent("remindMe", remindMe);

        PrintWriter writer = new PrintWriter("guildData/" + guild.getId() + ".json", "UTF-8");
        writer.println(guildItems.toString());
        writer.close();

        return guildItems;
    }


    @SuppressWarnings("unchecked")
    public void onGuildMemberLeave​(GuildMessageReceivedEvent event) {
        try {
            if (event.getMessage().getAuthor().getId() != event.getJDA().getSelfUser().getId()) {
                JSONObject guildData = getGuildData(event.getGuild());
                JSONObject ranksData = (JSONObject) guildData.get("ranks");
                
                ranksData.remove(event.getAuthor().getId());
                
                guildData.put("ranksData", ranksData);
                
                PrintWriter writer = new PrintWriter("guildData/" + event.getGuild().getId() + ".json", "UTF-8");
                writer.println(guildData.toString());
                writer.close();
            }
        } catch (Exception e1) {
            // TODO Auto-generated catch block
            e1.printStackTrace();
        }
    }
}
