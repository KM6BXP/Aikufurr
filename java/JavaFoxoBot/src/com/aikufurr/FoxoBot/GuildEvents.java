package com.aikufurr.FoxoBot;

import java.awt.Color;

import com.aikufurr.modules.Web;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.TextChannel;
import net.dv8tion.jda.api.events.guild.GuildJoinEvent;
import net.dv8tion.jda.api.events.guild.GuildLeaveEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

public class GuildEvents extends ListenerAdapter{
    private static Web web = new Web();
    
    public void log(String message) {
        if (FoxoBot.logEnabled) {
            FoxoBot.logChannel.sendMessage(message);
        }
    }

    public void onGuildJoin(GuildJoinEvent event) {
        FoxoBot.logChannel.sendMessage("Joined guild: " + event.getGuild().getName()).queue();
        TextChannel defaultChannel = event.getGuild().getDefaultChannel();
        EmbedBuilder em = new EmbedBuilder();
        em.setTitle("Introduction");
        em.setColor(Color.ORANGE);
        em.setDescription("Thank you for adding me, my default prefix is pinging me, eg @Foxobot#6148 help");
        em.setImage(web.get("https://aikufurr.com/api/images/fox").replaceAll("\"", ""));
        defaultChannel.sendMessage(em.build()).queue();
    }
    
    public void onGuildLeave(GuildLeaveEvent event) {
        FoxoBot.logChannel.sendMessage("Left guild: " + event.getGuild().getName()).queue();
    }

}
