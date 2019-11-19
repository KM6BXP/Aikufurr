package com.aikufurr.FoxoBot;

import com.aikufurr.modules.*;

import java.awt.Color;
import java.util.ArrayList;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.events.message.guild.GuildMessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

public class Commands extends ListenerAdapter {

    private static Web web = new Web();
    private static Conversion converter = new Conversion();

    public void onGuildMessageReceived(GuildMessageReceivedEvent event) {
        if (event.getMessage().getAuthor().getId() != event.getJDA().getSelfUser().getId()) {
            String[] args = event.getMessage().getContentRaw().split(" ");
            String prefix = "<@" + event.getJDA().getSelfUser().getId() + ">";
            if (args[0].equalsIgnoreCase(prefix)) {
                if (args[1].equalsIgnoreCase("init")) {
                    event.getMessage().addReaction("kade:550137030844088321").queue();
                    event.getMessage().addReaction("nicole:550137074515443734").queue();
                    event.getMessage().addReaction("riley:550137124222009384").queue();
                    event.getMessage().addReaction("rick:550137100234784808").queue();
                    event.getMessage().addReaction("harvey:550136985495535616").queue();
                    event.getMessage().addReaction("ness:550137053669752849").queue();
                }
                if (args[1].equalsIgnoreCase("ping")) {
                    event.getChannel().sendMessage("Pong").queue();
                } else if (args[1].equalsIgnoreCase("help")) {
                    if (args.length == 2) {
                        EmbedBuilder em = new EmbedBuilder();
                        em.setTitle("Help");
                        em.setColor(Color.ORANGE);
                        em.setDescription("To get more infomation on a command type `help [command]`");
                        em.addField("Images",
                                String.format("For a list of all the images %s can send, type `help images`",
                                        event.getJDA().getSelfUser().getName()),
                                true);
                        event.getChannel().sendMessage(em.build()).queue();
                    } else {
                        if (args[2].equalsIgnoreCase("images")) {
                            try {
                                String result = web.get("https://aikufurr.com/api/images");
                                ArrayList<String> res = converter.stringToArrayList(result);
                                
                                String out = "";
                                
                                for (String o : res) {
                                    out += o.replaceAll("(.*/)|(\")", "") + "\n";
                                }
                                EmbedBuilder em = new EmbedBuilder();
                                em.setTitle("Help - Images");
                                em.setColor(Color.ORANGE);
                                em.setDescription("All images that start with `y` are nsfw");
                                em.addField("Images", out, false);
                                event.getChannel().sendMessage(em.build()).queue();
                            } catch (Exception e) {
                                // TODO Auto-generated catch block
                                e.printStackTrace();
                            }
                        }
                    }
                } else {
                    try {
                        if (!event.getChannel().isNSFW() && args[1].startsWith("y")) {
                            return;
                        }
                        String result = web.get("https://aikufurr.com/api/images/" + args[1]);
                        ArrayList<String> res = converter.stringToArrayList(result);
                        EmbedBuilder em = new EmbedBuilder();
                        em.setColor(Color.ORANGE);
                        em.setImage((String) res.get(0).replaceAll("\"", ""));
                        event.getChannel().sendMessage(em.build()).queue();
                    } catch (Exception e) {
                        // TODO: handle exception
                        e.printStackTrace();
                    }
                }
            }
        }
    }
}
