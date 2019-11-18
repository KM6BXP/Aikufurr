package com.aikufurr.FoxoBot;

import net.dv8tion.jda.api.events.message.guild.react.GuildMessageReactionAddEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

public class GenericMessageReactionAdd extends ListenerAdapter {
    
    String SaveStateRoleID = "645451863193419796";

    public void onGuildMessageReactionAdd(GuildMessageReactionAddEvent event) {
        if (event.getMember().getUser().getId() != event.getJDA().getSelfUser().getId()) {
            if (SaveStateRoleID.contains(event.getMessageId().toString())) {
                String[] rolesToRemove = {"549749896803254272", "549749898363535373", "549749899416174603", "549749894286540816", "549749900599099394", "549750044971106367"};
                for (String role : rolesToRemove) {
                    try {
                        event.getGuild().removeRoleFromMember(event.getMember(), event.getGuild().getRoleById(role)).queue();
                    } catch(Exception e) {
                        
                    }
                }
                if (event.getReactionEmote().getName().endsWith("kade")) {
                    event.getGuild().addRoleToMember(event.getMember(), event.getGuild().getRoleById("549749896803254272")).queue();
                }
                if (event.getReactionEmote().getName().endsWith("nicole")) {
                    event.getGuild().addRoleToMember(event.getMember(), event.getGuild().getRoleById("549749898363535373")).queue();
                }
                if (event.getReactionEmote().getName().endsWith("harvey")) {
                    event.getGuild().addRoleToMember(event.getMember(), event.getGuild().getRoleById("549749899416174603")).queue();
                }
                if (event.getReactionEmote().getName().endsWith("rick")) {
                    event.getGuild().addRoleToMember(event.getMember(), event.getGuild().getRoleById("549749894286540816")).queue();
                }
                if (event.getReactionEmote().getName().endsWith("ness")) {
                    event.getGuild().addRoleToMember(event.getMember(), event.getGuild().getRoleById("549749900599099394")).queue();
                }
                if (event.getReactionEmote().getName().endsWith("riley")) {
                    event.getGuild().addRoleToMember(event.getMember(), event.getGuild().getRoleById("549750044971106367")).queue();
                }
                event.getReaction().removeReaction(event.getMember().getUser()).queue();
            }
        }
    }
}
