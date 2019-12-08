package com.aikufurr.FoxoBot;

import java.io.File;
import java.io.IOException;
import java.util.Map;
import java.util.Timer;

import javax.security.auth.login.LoginException;

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

public class FoxoBot {
    public static JDA jda;
    public static TextChannel logChannel;
    public static Boolean logEnabled = false;

    // Start
    public static void main(String[] args)
            throws JsonParseException, JsonMappingException, IOException, LoginException, InterruptedException {
        // read JSON from a file
        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> map = mapper.readValue(new File("data.json"), new TypeReference<Map<String, Object>>() {
        });

        jda = new JDABuilder(AccountType.BOT).setToken((String) map.get("token")).build();
        jda.getPresence().setActivity(Activity.watching("Foxes Playing"));
        jda.addEventListener(new Commands());
        jda.addEventListener(new GenericMessageReactionAdd());
        jda.addEventListener(new GuildEvents());
        jda.awaitReady();
        logChannel = jda.getGuildById("485960253016637453").getTextChannelById("648576645279776770");
        System.out.println("Set log channel to: " + logChannel.getName());
        if (FoxoBot.logEnabled) {
            logChannel.sendMessage("Starting").queue();
        }
        System.out.println("Logged in as: " + jda.getSelfUser().getName());
        System.out.println("Amount of guilds: " + jda.getGuilds().size());
        System.out.print("Guilds:");
        for (Guild g : jda.getGuilds()) {
            System.out.print(" || " + g.getName());
        }
        System.out.println(" |@ Total: " + jda.getGuilds().size());
        if (FoxoBot.logEnabled) {
            logChannel.sendMessage("Initializing Timer Class").queue();
        }
        Timer timer = new Timer();
        timer.schedule(new TimerTaskClass(), 0, 5000);
        if (FoxoBot.logEnabled) {
            logChannel.sendMessage("Initialized Timer Class").queue();
        }

        if (FoxoBot.logEnabled) {
            logChannel.sendMessage("CWD: " + System.getProperty("user.dir")).queue();
        }

        if (FoxoBot.logEnabled) {
            logChannel.sendMessage("Started").queue();
        }

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
