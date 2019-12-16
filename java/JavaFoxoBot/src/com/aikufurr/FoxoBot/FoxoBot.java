package com.aikufurr.FoxoBot;

import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Timer;

import javax.security.auth.login.LoginException;

import org.json.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import net.dv8tion.jda.api.AccountType;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.entities.Activity;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.entities.TextChannel;
import net.dv8tion.jda.api.requests.restaction.InviteAction;

public class FoxoBot {
    public static JDA jda;
    public static TextChannel logChannel;
    public static Boolean logEnabled = false;

    // Start
    @SuppressWarnings("unchecked")
    public static void main(String[] args) throws JsonParseException, JsonMappingException, IOException, LoginException,
            InterruptedException, ParseException {
        // read JSON from a file

        JSONObject dataFile;

        File f = new File("data.json");
        if (f.exists() && !f.isDirectory()) {
            JSONParser parser = new JSONParser();
            Path pathStr = Paths.get("data.json");
            String content = Files.readString(pathStr);
            Object obj = parser.parse(content.toString());
            dataFile = (JSONObject) obj;
        } else {
            dataFile = new JSONObject();
        }
        dataFile.putIfAbsent("token", "enter-token-here");

        PrintWriter writer = new PrintWriter("data.json", "UTF-8");
        writer.println(dataFile.toString());
        writer.close();

        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> map = mapper.readValue(new File("data.json"), new TypeReference<Map<String, Object>>() {
        });

        if (((String) map.get("token")).contains("enter-token-here")) {
            System.out.println("Please open data.json and enter token");
            return;
        }

        jda = new JDABuilder(AccountType.BOT).setToken((String) map.get("token")).build();
        jda.getPresence().setActivity(Activity.watching("Foxes Playing"));
        jda.addEventListener(new Commands());
        jda.addEventListener(new GenericMessageReactionAdd());
        jda.addEventListener(new GuildEvents());
        jda.awaitReady();
        System.out.println("Logged in as: " + jda.getSelfUser().getName());
        System.out.println("Amount of guilds: " + jda.getGuilds().size());
        System.out.print("Guilds:");
        for (Guild g : jda.getGuilds()) {
            System.out.print(" || " + g.getName() + "@" + g.getId());
        }
        System.out.println(" |@ Total: " + jda.getGuilds().size());

        Timer timer = new Timer();
        timer.schedule(new TimerTaskClass(), 0, 5000);
    }

//    ObjectMapper mapper = new ObjectMapper();
//    Map<String, Object> map = new HashMap<String, Object>();
//    map.put("name", "Suson");
//    map.put("age", 26);
//    mapper.writeValue(new File("data.json"), map);

//    ObjectMapper mapper = new ObjectMapper();
//    Map<String, Object> map = mapper.readValue(
//            new File("c:\\myData.json"),
//            new TypeReference<Map<String, Object>>() {
//    });
//    System.out.println(map.get("name"));
//    System.out.println(map.get("age"));
}
