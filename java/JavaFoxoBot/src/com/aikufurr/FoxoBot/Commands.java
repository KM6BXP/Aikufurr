package com.aikufurr.FoxoBot;

import com.aikufurr.modules.*;

import java.awt.Color;
import java.io.File;
import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.Iterator;
import java.util.List;
import java.util.Random;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

import net.dv8tion.jda.api.EmbedBuilder;
import net.dv8tion.jda.api.entities.Guild;
import net.dv8tion.jda.api.entities.User;
import net.dv8tion.jda.api.events.message.guild.GuildMessageReceivedEvent;
import net.dv8tion.jda.api.hooks.ListenerAdapter;

class rankClass {
    String key;
    int value;

    rankClass(String key, int value) {
        this.key = key;
        this.value = value;
    }
}

public class Commands extends ListenerAdapter {
    private static Web web = new Web();
    private static Conversion converter = new Conversion();

    public static boolean isNumeric(String strNum) {
        if (strNum == null) {
            return false;
        }
        try {
            double d = Double.parseDouble(strNum);
        } catch (NumberFormatException nfe) {
            return false;
        }
        return true;
    }

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

    public User getUserFromMention(String mention) {
        if (mention.startsWith("<@") && mention.endsWith(">")) {
            mention = mention.replaceAll("<", "");
            mention = mention.replaceAll(">", "");
            mention = mention.replaceAll("@", "");
            mention = mention.replaceAll("!", "");

            return FoxoBot.jda.getUserById(mention);
        }
        return null;
    }

    public void addDate(Calendar cal, String t) {
        String delim = ":";
        Integer x = 0;
        Integer z = 0;

        String[] arr = t.split(delim);

        for (Integer i = 0; i < arr.length; i++) {
            z = Integer.parseInt(arr[i].substring(0, arr[i].length() - 1), 10);
            if (z != null) {
                Integer y = arr[i].matches("\\d+?y") ? 31556926 : 0;
                Integer w = arr[i].matches("\\d+?w") ? 604800 : 0;
                Integer d = arr[i].matches("\\d+?d") ? 84600 : 0;
                Integer h = arr[i].matches("\\d+?h") ? 3600 : 0;
                Integer m = arr[i].matches("\\d+?m") ? 60 : 0;
                Integer s = arr[i].matches("\\d+?s") ? 1 : 0;
                x += z * (y + w + d + h + m + s);
            }
        }

        cal.add(Calendar.SECOND, x);
    }

    @SuppressWarnings("unchecked")
    public void onGuildMessageReceived(GuildMessageReceivedEvent event) {
        if (!event.getGuild().getName().toLowerCase().contains("save")) {
            System.out.println("GUILD: " + event.getGuild().getName() + " SENDER: " + event.getAuthor().getName()
                    + " MSG: " + event.getMessage().getContentRaw());
        }
        try {
            if (event.getMessage().getAuthor().getId() != event.getJDA().getSelfUser().getId()) {
                String[] lines = event.getMessage().getContentRaw().split("\n");
                String[] args = event.getMessage().getContentRaw().split(" ");

                JSONObject guildData = getGuildData(event.getGuild());

                String prefix = guildData.get("prefix").toString();
                // String prefix = "=";

                JSONObject ranksData = (JSONObject) guildData.get("ranks");

                try {
                    ranksData.put(event.getAuthor().getId(),
                            Integer.parseInt(ranksData.get(event.getAuthor().getId()).toString()) + 1);
                } catch (Exception e) {
                    ranksData.put(event.getAuthor().getId(), 1);
                }
                JSONArray toggledCommandsArray = new JSONArray(guildData.get("toggledCommands").toString());

                // Throws java.lang.StringIndexOutOfBoundsException: String index out of range:
                // 0 Error idk why
                if (args[0].startsWith(prefix)) {
                    args[0] = args[0].substring(prefix.length());
                    for (int i = 0; i < toggledCommandsArray.length(); i++) {
                        System.out.println(args[0] + " " + toggledCommandsArray.get(i));
                        if (args[0].equals(toggledCommandsArray.get(i))) {
                            return;
                        }
                    }
//                if (args[0].equalsIgnoreCase("init")) {
//                    event.getMessage().addReaction("kade:550137030844088321").queue();
//                    event.getMessage().addReaction("nicole:550137074515443734").queue();
//                    event.getMessage().addReaction("riley:550137124222009384").queue();
//                    event.getMessage().addReaction("rick:550137100234784808").queue();
//                    event.getMessage().addReaction("harvey:550136985495535616").queue();
//                    event.getMessage().addReaction("ness:550137053669752849").queue();
//                } else
                    System.out.println(Arrays.toString(args));
                    if (args[0].equalsIgnoreCase("ping")) {
                        event.getChannel().sendMessage("Pong").queue();
                    } else if (args[0].equalsIgnoreCase("flip-a-coin") || args[0].equalsIgnoreCase("flipacoin")
                            || args[0].equalsIgnoreCase("flip") || args[0].equalsIgnoreCase("coin")) {
                        ArrayList<String> headTails = new ArrayList<String>();
                        headTails.add("Heads");
                        headTails.add("Tails");
                        Random r = new Random();
                        int size = headTails.size();
                        int index = r.nextInt(size);
                        String randomItem = headTails.get(index);
                        event.getChannel().sendMessage(randomItem).queue();
                    } else if (args[0].split("\n")[0].equalsIgnoreCase("pick")) {
                        if (args.length == 1) {
                            return;
                        }
                        Random r = new Random();
                        int size = lines.length;
                        int index = r.nextInt(size);
                        String randomItem = lines[index];
                        event.getChannel().sendMessage(randomItem).queue();
                    } else if (args[0].split("\n")[0].equalsIgnoreCase("roll")) {
                        if (args.length == 1 || !isNumeric(args[1])) {
                            event.getChannel().sendMessage("You must enter a number").queue();
                            return;
                        }
                        Random r = new Random();
                        int index = r.nextInt(Integer.parseInt(args[1])); // TODO: Make double
                        event.getChannel().sendMessage("Rolled: " + index).queue();
                    } else if (args[0].equalsIgnoreCase("invite")) {
                        event.getChannel().sendMessage(
                                "My Invite Link: https://discordapp.com/api/oauth2/authorize?client_id=618802156283363328&permissions=8&scope=bot");
                    } else if (args[0].equalsIgnoreCase("settings")) {
                        if (args.length == 1) {
                            // TODO
                        }
                    } else if (args[0].equalsIgnoreCase("remindme")) {
                        if (args.length == 1) {
                            JSONObject remindMe = (JSONObject) guildData.get("remindMe");
                            JSONArray remindMeOGArray = new JSONArray(
                                    remindMe.get(event.getAuthor().getId()).toString());
                            String items = "";
                            for (int i = 0; i < remindMeOGArray.length(); i++) {
                                JSONArray subArray = new JSONArray(remindMeOGArray.get(i).toString());
                                Calendar cal = Calendar.getInstance();
                                cal.setTimeInMillis(Long.parseLong(subArray.get(0).toString()));
                                items += "`" + subArray.get(1).toString() + "` at `" + cal.getTime() + "`" + "\n";
                            }
                            EmbedBuilder em = new EmbedBuilder();
                            em.setTitle("Your RemindMes");
                            em.setDescription(items);
                            event.getChannel().sendMessage(em.build()).queue();
                        } else {
                            String item = "";
                            for (Integer i = 2; i < args.length; i++) {
                                item += args[i] + " ";
                            }

                            Calendar cal = Calendar.getInstance();
                            cal.setTime(new Date());
                            addDate(cal, args[1]);
                            JSONObject remindMe = (JSONObject) guildData.get("remindMe");
                            JSONArray remindMeOGArray;
                            try {
                                remindMeOGArray = new JSONArray(remindMe.get(event.getAuthor().getId()).toString());
                            } catch (Exception e) {
                                remindMeOGArray = new JSONArray();
                            }
                            JSONArray remindMeArray = new JSONArray();
                            remindMeArray.put(String.valueOf(cal.getTimeInMillis()));
                            remindMeArray.put(item.subSequence(0, item.length() - 1));
                            remindMeOGArray.put(remindMeArray);
                            remindMe.put(event.getAuthor().getId(), remindMeOGArray);
                            guildData.put("remindMe", remindMe);
                            event.getChannel().sendMessage("I will remind you: `"
                                    + item.subSequence(0, item.length() - 1) + "` at: `" + cal.getTime() + "`").queue();
                        }
                    } else if (args[0].equalsIgnoreCase("test1")) {
                        // TODO
                    } else if (args[0].equalsIgnoreCase("hugself")) {
                        event.getChannel().sendMessage("I'm sorry").queue();
                    } else if (args[0].equalsIgnoreCase("rank")) {
                        org.json.JSONObject obj = new org.json.JSONObject(guildData.get("ranks").toString());
                        List<rankClass> list = new ArrayList<>();
                        Iterator<?> keys = obj.keys();
                        rankClass objnew;
                        while (keys.hasNext()) {
                            String key = (String) keys.next();
                            objnew = new rankClass(key, obj.optInt(key));
                            list.add(objnew);
                        }

                        // sorting the values
                        Collections.sort(list, new Comparator<rankClass>() {
                            public int compare(rankClass o1, rankClass o2) {
                                return Integer.compare(o2.value, o1.value);
                            }
                        });
                        JSONArray ranked = new JSONArray();
                        // print out put
                        for (rankClass m : list) {
                            JSONArray subranked = new JSONArray();
                            subranked.put(m.key);
                            subranked.put(m.value);
                            ranked.put(subranked);
                        }
                        if (args.length == 1) {
                            for (int i = 0; i < ranked.length(); i++) {
                                JSONArray rankedArray = new JSONArray(ranked.get(i).toString());
                                if (event.getAuthor().getId().equals(rankedArray.get(0))) {
                                    EmbedBuilder em = new EmbedBuilder();
                                    em.setColor(Color.ORANGE);
                                    em.setTitle(event.getAuthor().getName() + "'s Rank");
                                    em.addField("Rank", i + 1 + "/" + event.getGuild().getMembers().size(), true);
                                    em.addField("Messages", rankedArray.get(1).toString(), true);
                                    event.getChannel().sendMessage(em.build()).queue();
                                }
                            }
                        } else {
                            User mentionedUser = getUserFromMention(args[1]);
                            for (int i = 0; i < ranked.length(); i++) {
                                JSONArray rankedArray = new JSONArray(ranked.get(i).toString());
                                if (mentionedUser.getId().equals(rankedArray.get(0))) {
                                    EmbedBuilder em = new EmbedBuilder();
                                    em.setColor(Color.ORANGE);
                                    em.setTitle(mentionedUser.getName() + "'s Rank");
                                    em.addField("Rank", i + 1 + "/" + event.getGuild().getMembers().size(), true);
                                    em.addField("Messages", rankedArray.get(1).toString(), true);
                                    event.getChannel().sendMessage(em.build()).queue();
                                }
                            }
                        }

                    } else if (args[0].equalsIgnoreCase("leaderboard")) {
                        // copy-pasted this from -rank and hoping beyond all hope it works
                        org.json.JSONObject obj = new org.json.JSONObject(guildData.get("ranks").toString());
                        List<rankClass> list = new ArrayList<>();
                        Iterator<?> keys = obj.keys();
                        rankClass objnew;
                        while (keys.hasNext()) {
                            String key = (String) keys.next();
                            objnew = new rankClass(key, obj.optInt(key));
                            list.add(objnew);
                        }

                        // sorting the values
                        Collections.sort(list, new Comparator<rankClass>() {
                            public int compare(rankClass o1, rankClass o2) {
                                return Integer.compare(o2.value, o1.value);
                            }
                        });
                        JSONArray ranked = new JSONArray();
                        // print out put
                        for (rankClass m : list) {
                            JSONArray subranked = new JSONArray();
                            subranked.put(m.key);
                            subranked.put(m.value);
                            ranked.put(subranked);
                        }
                        // that's the end of that copy-pasted bit
                        
                        if (ranked.length() < 10) {
                            event.getChannel().sendMessage("Not enough members to do the leaderboard, get typing!").queue();
                            return;
                        }
                        
                        EmbedBuilder em = new EmbedBuilder();
                        em.setColor(Color.ORANGE);
                        em.setTitle("Top 10 Leaderboard");
                        for (int i = 0; i < 10; i++) {
                            JSONArray rankedArray = new JSONArray(ranked.get(i).toString());
                            // If you wanted their nickname: event.getGuild().getMemberById(rankedArray.get(0).toString()).getNickname()
                            em.addField("Position " + (i + 1), FoxoBot.jda.getUserById(rankedArray.get(0).toString()).getName() + " @ " + rankedArray.get(1).toString(), false);
                        }
                        
                        event.getChannel().sendMessage(em.build()).queue();
                        
                    } else if (args[0].equalsIgnoreCase("help")) {
                        if (args.length == 1) {
                            EmbedBuilder em = new EmbedBuilder();
                            em.setTitle("Help");
                            em.setColor(Color.ORANGE);
                            em.setDescription(
                                    "If a command has a `*` next to it you can type `help [command]` to get for info on it.");
                            em.addField("Fun", "`pick`*\n`flip` or `flip-a-coin` or `coin`\n`rank`*", true);
                            em.addField("Images *",
                                    String.format("For a list of all the images %s can send, type `help images`",
                                            event.getJDA().getSelfUser().getName()),
                                    true);
                            event.getChannel().sendMessage(em.build()).queue();
                        } else {
                            if (args[1].equalsIgnoreCase("pick")) {
                                EmbedBuilder em = new EmbedBuilder();
                                em.setTitle("Help - Pick");
                                em.setColor(Color.ORANGE);
                                em.setDescription("Picks from a provided list (uses multiline feature of Discord)");
                                em.addField("Example usage", "pick\nOption1\nOption2\nOption3", false);
                                event.getChannel().sendMessage(em.build()).queue();
                            }
                            if (args[1].equalsIgnoreCase("rank")) {
                                EmbedBuilder em = new EmbedBuilder();
                                em.setTitle("Help - Rank");
                                em.setColor(Color.ORANGE);
                                em.setDescription("Displays your rank in this guild");
                                em.addField("Example usage to get your rank", "rank", false);
                                em.addField("Example usage to get someone elses rank", "rank @person", false);
                                event.getChannel().sendMessage(em.build()).queue();
                            }
                            if (args[1].equalsIgnoreCase("images") || args[1].equalsIgnoreCase("image")) {
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
                                    em.addField("Images", out, true);
                                    em.addField("Usage", "[image] (amount)", true);
                                    event.getChannel().sendMessage(em.build()).queue();
                                } catch (Exception e) {
                                    // TODO Auto-generated catch block
                                    e.printStackTrace();
                                }
                            }
                        }
                    } else {
                        try {
                            if (!event.getChannel().isNSFW() && args[0].startsWith("y")) {
                                return;
                            }
                            if (web.get("https://aikufurr.com/api/images/" + args[0]) == "") {
                                return;
                            }
                            int spam = 1;
                            for (int i = 0; i < args.length; i++) {
                                args[i].replaceAll(" ", "");
                            }
                            if (args.length == 2) {
                                try {
                                    spam = Integer.parseInt(args[1]);
                                    if (spam > 20) {
                                        event.getChannel().sendMessage("The limit is 20 per command").queue();
                                        return;
                                    }
                                } catch (Exception e) {
                                    spam = 1;
                                }
                                if (args[1].startsWith("<")) {
                                    spam = 1;
                                }
                                ;
                            } else {
                                spam = 1;
                            }
                            for (int i = 0; i < spam; i++) {
                                String result = web.get("https://aikufurr.com/api/images/" + args[0]);
                                EmbedBuilder em = new EmbedBuilder();

                                org.json.JSONObject imageMessages = new org.json.JSONObject();

                                JSONArray hug = new JSONArray();
                                hug.put("USER1 gives USER2 a big ol' hug");
                                hug.put("USER1 sneaks up behind USER2 and gives them a surprise hug");
                                hug.put("USER1 hugs USER2 with a very warm smile");
                                hug.put("USER1 lunges at USER2, wrapping their arms around lovingly");
                                hug.put("USER1 blushes a little bit, carefully approaching USER2 and giving them a tender hug");
                                hug.put("USER2 wasn't suspecting anything at first, but then suddenly USER1 appears and hugs them!");
                                hug.put("USER1 scoots closer over to USER2 on a park bench, then wraps their arms around them, giving them an unsuspecting hug");
                                hug.put("USER1 opens their arms for USER2 so they could get a lovable hug from USER1");
                                hug.put("USER1 gives USER2 a loving hug");
                                imageMessages.put("hug", hug);
                                JSONArray kiss = new JSONArray();
                                kiss.put("USER1 gives USER2 a loving kiss");
                                kiss.put("USER1 kisses USER2");
                                kiss.put("USER2 has been kissed by USER1");
                                kiss.put("USER1 lovingly kisses USER2");
                                imageMessages.put("kiss", kiss);
                                JSONArray cuddle = new JSONArray();
                                cuddle.put("USER1 gives USER2 a loving cuddle");
                                cuddle.put("USER1 cuddles USER2");
                                cuddle.put("USER1 sits down next to USER2 and cuddles them");
                                cuddle.put("USER2 has been cuddles by USER1");
                                cuddle.put("USER1 lovingly cuddles USER2");
                                imageMessages.put("cuddle", cuddle);
                                JSONArray hold = new JSONArray();
                                hold.put("USER1 holds USER2 close");
                                hold.put("USER1 holds USER2 close to them");
                                hold.put("USER1 holds USER2 tightly");
                                hold.put("USER1 holds USER2");
                                hold.put("USER1 sits down next to USER2 and holds them");
                                hold.put("USER1 sits down next to USER2 and holds them tight");
                                hold.put("USER1 lovingly holds USER2");
                                hold.put("USER1 lovingly holds USER2 close to them");
                                imageMessages.put("hold", hold);
                                JSONArray lick = new JSONArray();
                                lick.put("USER1 licks USER2");
                                lick.put("USER1 shyly gives USER2 a lick");
                                lick.put("USER1 lovingly licks USER2");
                                lick.put("USER2 gets a lick from USER1");
                                imageMessages.put("lick", lick);
                                System.out.println(event.getGuild().getId());
                                if (args.length > 1) {
                                    if (!isNumeric(args[1])) {
                                        if (imageMessages.has(args[0])) {
                                            Random r = new Random();
                                            int size = imageMessages.getJSONArray(args[0]).length();
                                            int index = r.nextInt(size);
                                            String randomItem = imageMessages.getJSONArray(args[0]).getString(index);
                                            if (event.getGuild().getId().contains("485960253016637453")) {
                                                randomItem = "USER1 cuddles next to USER2 with a warm cocoa in their hands";
                                            }
                                            randomItem = randomItem.replaceAll("USER1", event.getAuthor().getName());
                                            if (args[1].startsWith("<") && args[1].endsWith(">")) {
                                                randomItem = randomItem.replaceAll("USER2",
                                                        getUserFromMention(args[1]).getName());
                                            } else {
                                                randomItem = randomItem.replaceAll("USER2", args[1]);
                                            }

                                            em.setDescription(randomItem);
                                        }
                                    }
                                }

                                em.setColor(Color.ORANGE);
                                if (event.getGuild().getId().contains("485960253016637453")) {
                                    em.setImage(
                                            (String) "https://aikufurr.com/api/images/hug/1576558268.rubyd8_ych_cocoa_cuddles_gigabytegb1.jpg");
                                } else {
                                    em.setImage((String) result.replaceAll("\"", "").replaceAll(" ", "%20"));
                                }
                                event.getChannel().sendMessage(em.build()).queue();
                            }
                        } catch (Exception e) {
                            // TODO: handle exception
                            e.printStackTrace();
                        }
                    }
                }
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
