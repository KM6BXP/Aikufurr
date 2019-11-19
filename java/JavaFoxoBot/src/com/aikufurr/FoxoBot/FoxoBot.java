package com.aikufurr.FoxoBot;

import java.io.File;
import java.io.IOException;
import java.util.Map;

import javax.security.auth.login.LoginException;

import com.fasterxml.jackson.core.JsonGenerationException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import net.dv8tion.jda.api.AccountType;
import net.dv8tion.jda.api.JDA;
import net.dv8tion.jda.api.JDABuilder;
import net.dv8tion.jda.api.entities.Activity;

public class FoxoBot {
    public static JDA jda;

    // Start
    public static void main(String[] args) throws LoginException, InterruptedException, JsonGenerationException, JsonMappingException, IOException {
        ObjectMapper mapper = new ObjectMapper();

        // read JSON from a file
        Map<String, Object> map = mapper.readValue(
                new File("data.json"),
                new TypeReference<Map<String, Object>>() {
        });
        
        jda = new JDABuilder(AccountType.BOT).setToken((String) map.get("token")).build();
        jda.getPresence().setActivity(Activity.watching("Foxes"));
        jda.addEventListener(new Commands());
        jda.addEventListener(new GenericMessageReactionAdd());
        jda.awaitReady();
        System.out.println("Logged in as: " + jda.getSelfUser().getName());

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
