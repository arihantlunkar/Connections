using MySql.Data.MySqlClient;
using Newtonsoft.Json;
using System;
using System.IO;
using System.Windows.Forms;
using System.Configuration;
using System.Collections.Generic;

namespace Connections
{
    public partial class Form1 : Form
    {
        MySqlConnection mySqlConnection;
        List<Task> tasks = new List<Task>();
        int currentTask = 0;
        int currentImageCounter = 0;

        public Form1()
        {
            InitializeComponent();

            InitMysqlConnection();

            InitTasks();

            if (0 == tasks.Count)
            {
                MessageBox.Show("No task pending");
                this.Load += CloseForm;
            }
            else
            {
                DoTask();
            }
        }

        private void DoTask()
        {
            button3.Enabled = true;
            button1.Enabled = false;
            label13.Text = "Viewing biodata " + (currentTask + 1) + " of " + tasks.Count;

            DisplayResultOfTask();
            InitData();
        }

        private string GetUploadTime(int count)
        {
            return tasks[count].uploadedBy.uploadTime[0] + "" +
            tasks[count].uploadedBy.uploadTime[1] + "/" +
            tasks[count].uploadedBy.uploadTime[2] + "" +
            tasks[count].uploadedBy.uploadTime[3] + "/" +
            tasks[count].uploadedBy.uploadTime[4] + "" +
            tasks[count].uploadedBy.uploadTime[5] + "" +
            tasks[count].uploadedBy.uploadTime[6] + "" +
            tasks[count].uploadedBy.uploadTime[7] + " " +
            tasks[count].uploadedBy.uploadTime[8] + "" +
            tasks[count].uploadedBy.uploadTime[9] + ":" +
            tasks[count].uploadedBy.uploadTime[10] + "" +
            tasks[count].uploadedBy.uploadTime[11] + ":" +
            tasks[count].uploadedBy.uploadTime[12] + "" +
            tasks[count].uploadedBy.uploadTime[13] + "";
        }

        private void InitTasks()
        {
            List<string> biodatas = GetNotVerifedBiodatas();
            foreach (string biodata in biodatas)
            {
                tasks.Add(new Task
                {
                    uploadedBy = GetUploadInfo(biodata),
                    info = GetBiodataInfo(biodata)
                });
            }
        }

        private Uploadedby GetUploadInfo(string biodata)
        {
            Uploadedby uploadedby = new Uploadedby
            {
                uploadTime = biodata
            };

            try
            {
                using (MySqlCommand cmd = new MySqlCommand("SELECT `fromID` FROM `upload` WHERE `biodataID` = '" + biodata + "';", mySqlConnection))
                {
                    uploadedby.id = Convert.ToString(cmd.ExecuteScalar());
                }
                using (MySqlCommand cmd = new MySqlCommand("SELECT `name`,`email` FROM `users` WHERE `id`='" + uploadedby.id + "';", mySqlConnection))
                {
                    MySqlDataReader dataReader = cmd.ExecuteReader();
                    while (dataReader.Read())
                    {
                        uploadedby.name = dataReader["name"].ToString();
                        uploadedby.email = dataReader["email"].ToString();
                        break;
                    }
                    dataReader.Close();
                }
            }
            catch (InvalidOperationException ex)
            {
                MessageBox.Show(ex.Message.ToString());
                this.Load += CloseForm;
            }
            catch (MySqlException ex)
            {
                MessageBox.Show(ex.Message.ToString());
                this.Load += CloseForm;
            }
            return uploadedby;
        }

        private Info GetBiodataInfo(string biodata)
        {
            Info info = new Info
            {
                images = new List<string>()
            };
            try
            {
                using (MySqlCommand cmd = new MySqlCommand("SELECT `biodataLink`,`image1Link`,`image2Link`,`image3Link`,`image4Link`,`image5Link` FROM `biodata` WHERE `id`= '" + biodata + "';", mySqlConnection))
                {
                    MySqlDataReader dataReader = cmd.ExecuteReader();
                    while (dataReader.Read())
                    {
                        info.biodataUrl = dataReader["biodataLink"].ToString();
                        if(0 != dataReader["image1Link"].ToString().Length)
                            info.images.Add(dataReader["image1Link"].ToString());
                        if (0 != dataReader["image2Link"].ToString().Length)
                            info.images.Add(dataReader["image2Link"].ToString());
                        if (0 != dataReader["image3Link"].ToString().Length)
                            info.images.Add(dataReader["image3Link"].ToString());
                        if (0 != dataReader["image4Link"].ToString().Length)
                            info.images.Add(dataReader["image4Link"].ToString());
                        if (0 != dataReader["image5Link"].ToString().Length)
                            info.images.Add(dataReader["image5Link"].ToString());
                        break;
                    }
                    dataReader.Close();
                }
            }
            catch (InvalidOperationException ex)
            {
                MessageBox.Show(ex.Message.ToString());
                this.Load += CloseForm;
            }
            catch (MySqlException ex)
            {
                MessageBox.Show(ex.Message.ToString());
                this.Load += CloseForm;
            }

            return info;
        }

        private List<string> GetNotVerifedBiodatas()
        {
            List<string> biodatas = new List<string>();
            try
            {
                using (MySqlCommand cmd = new MySqlCommand("SELECT `biodataID` FROM `verification` WHERE `isVerified` = 0;", mySqlConnection))
                {
                    MySqlDataReader dataReader = cmd.ExecuteReader();
                    while (dataReader.Read())
                    {
                        biodatas.Add(dataReader.GetString(0));
                    }
                    dataReader.Close();
                }
            }
            catch(InvalidOperationException ex)
            {
                MessageBox.Show(ex.Message.ToString());
                this.Load += CloseForm;
            }
            catch(MySqlException ex)
            {
                MessageBox.Show(ex.Message.ToString());
                this.Load += CloseForm;
            }
            return biodatas;
        }

        private void UpdateDB()
        {
            try
            {
                string query = "UPDATE `biodata` SET `name`='" + textBox1.Text + "',`additionalDetails`='" + textBox3.Text + "',`place`='" + comboBox4.SelectedItem + "',`profession`='" + comboBox2.SelectedItem + "',`age`='" + comboBox5.SelectedItem + "',`height`=\"" + comboBox6.SelectedItem + "\",`occupation`='" + comboBox7.SelectedItem + "',`lookingFor`='" + comboBox9.SelectedItem + "',`dosha`='" + comboBox10.SelectedItem + "',`maritialStatus`='" + comboBox11.SelectedItem + "',`sampradaya`='" + comboBox12.SelectedItem + "' WHERE `id`='" + tasks[currentTask].uploadedBy.uploadTime + "'";
                using (MySqlCommand cmd = new MySqlCommand(query, mySqlConnection))
                {
                    cmd.ExecuteNonQuery();
                }

                foreach (object itemChecked in checkedListBox1.CheckedItems)
                {
                    query = "INSERT INTO `education`(`biodataID`, `education`) VALUES ('"+ tasks[currentTask].uploadedBy.uploadTime + "','"+ itemChecked + "')";
                    using (MySqlCommand cmd = new MySqlCommand(query, mySqlConnection))
                    {
                        cmd.ExecuteNonQuery();
                    }
                }

                string isValid = comboBox1.SelectedItem.ToString() == "Valid" ? 1 + "" : 0 + "";
                query = "UPDATE `verification` SET `isVerified`='1',`isValid`='"+ isValid + "',`verifiedTime`='"+DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + "',`rejectionReason`='"+ comboBox1.SelectedItem + "' WHERE `biodataID`='"+ tasks[currentTask].uploadedBy.uploadTime + "';";
                using (MySqlCommand cmd = new MySqlCommand(query, mySqlConnection))
                {
                    cmd.ExecuteNonQuery();
                }
            }
            catch (InvalidOperationException ex)
            {
                MessageBox.Show(ex.Message.ToString());
                this.Load += CloseForm;
            }
            catch (MySqlException ex)
            {
                MessageBox.Show(ex.Message.ToString());
                this.Load += CloseForm;
            }
        }

        private void InitMysqlConnection()
        {
            try
            {
                string connectionString =
                    "datasource=" + ConfigurationSettings.AppSettings["datasource"] +
                    ";username=" + ConfigurationSettings.AppSettings["username"] +
                    ";password=" + ConfigurationSettings.AppSettings["password"] +
                    ";database=" + ConfigurationSettings.AppSettings["database"] + ";";

                mySqlConnection = new MySqlConnection(connectionString);
                mySqlConnection.Open();
            }
            catch (MySqlException ex)
            {
                MessageBox.Show(ex.Message.ToString());
                this.Load += CloseForm;
            }
        }

        private void CloseForm(object sender, EventArgs e)
        {
            mySqlConnection.Close();
            Close();
        }

        private void InitData()
        {
            try
            {
                using (StreamReader r = new StreamReader(@"data.json"))
                {
                    Data data = JsonConvert.DeserializeObject<Data>(r.ReadToEnd());

                    textBox1.Clear();
                    textBox3.Clear();

                    comboBox1.Items.Clear();
                    for (int i = 0; i < data.variousReasons.Length; ++i)
                    {
                        comboBox1.Items.Add(data.variousReasons[i]);
                    }

                    comboBox2.Items.Clear();
                    for (int i = 0; i < data.professions.Length; ++i)
                    {
                        comboBox2.Items.Add(data.professions[i]);
                    }

                    comboBox4.Items.Clear();
                    for (int i = 0; i < data.places.Length; ++i)
                    {
                        comboBox4.Items.Add(data.places[i]);
                    }

                    comboBox5.Items.Clear();
                    for (int i = data.minAge; i < data.maxAge; ++i)
                    {
                        comboBox5.Items.Add(i);
                    }

                    comboBox6.Items.Clear();
                    for (int i = 0; i < data.heights.Length; ++i)
                    {
                        comboBox6.Items.Add(data.heights[i]);
                    }

                    comboBox7.Items.Clear();
                    for (int i = 0; i < data.occupations.Length; ++i)
                    {
                        comboBox7.Items.Add(data.occupations[i]);
                    }

                    checkedListBox1.Items.Clear();
                    for (int i = 0; i < data.variousEducation.Length; ++i)
                    {
                        checkedListBox1.Items.Add(data.variousEducation[i]);
                    }

                    comboBox9.Items.Clear();
                    for (int i = 0; i < data.possibleLookingFor.Length; ++i)
                    {
                        comboBox9.Items.Add(data.possibleLookingFor[i]);
                    }

                    comboBox10.Items.Clear();
                    for (int i = 0; i < data.doshas.Length; ++i)
                    {
                        comboBox10.Items.Add(data.doshas[i]);
                    }

                    comboBox11.Items.Clear();
                    for (int i = 0; i < data.variousMartialStatus.Length; ++i)
                    {
                        comboBox11.Items.Add(data.variousMartialStatus[i]);
                    }

                    comboBox12.Items.Clear();
                    for (int i = 0; i < data.sampradayas.Length; ++i)
                    {
                        comboBox12.Items.Add(data.sampradayas[i]);
                    }

                    comboBox1.SelectedItem = data.defaultSelectedReason;
                    comboBox2.SelectedItem = data.defaultProfession;
                    comboBox4.SelectedItem = data.defaultSelectedPlace;
                    comboBox5.SelectedItem = data.defaultSelectedAge;
                    comboBox6.SelectedItem = data.defaultSelectedHeight;
                    comboBox7.SelectedItem = data.defaultSelectedOccupation;
                    for(int i=0;i< checkedListBox1.Items.Count;++i)
                    {
                        checkedListBox1.SetItemChecked(i, false);
                    }
                    checkedListBox1.SetItemChecked(Array.IndexOf(data.variousEducation, data.defaultSelectedEducation), true);
                    comboBox9.SelectedItem = data.defaultSelectedLookingFor;
                    comboBox10.SelectedItem = data.defaultSelectedDosha;
                    comboBox11.SelectedItem = data.defaultSelectedMaritalStatus;
                    comboBox12.SelectedItem = data.defaultSelectedSampradaya;
                }
            }
            catch (IOException ex)
            {
                MessageBox.Show(ex.Message.ToString());
                this.Load += CloseForm;
            }
        }

        private void Button3_Click(object sender, EventArgs e)
        {
            button1.Enabled = true;
            if (++currentImageCounter < tasks[currentTask].info.images.Count)
            {
                label12.Text = "Displaying image " + (currentImageCounter + 1) + " of " + tasks[currentTask].info.images.Count;
                pictureBox1.ImageLocation = ConfigurationSettings.AppSettings["backendUrl"] + "/" + tasks[currentTask].info.images[currentImageCounter];
            }
            if (currentImageCounter == tasks[currentTask].info.images.Count - 1)
                button3.Enabled = false;
        }

        private void Button1_Click(object sender, EventArgs e)
        {
            button3.Enabled = true;
            if (--currentImageCounter >= 0)
            {
                label12.Text = "Displaying image " + (currentImageCounter + 1) + " of " + tasks[currentTask].info.images.Count;
                pictureBox1.ImageLocation = ConfigurationSettings.AppSettings["backendUrl"] + "/" + tasks[currentTask].info.images[currentImageCounter];
            }
            if (currentImageCounter == 0)
                button1.Enabled = false;
        }

        private void TimerRemoveBlueHighlight_Tick(object sender, EventArgs e)
        {
            // Remove the Highlight
            comboBox1.Select(0, 0);
            comboBox2.Select(0, 0);
            comboBox4.Select(0, 0);
            comboBox5.Select(0, 0);
            comboBox6.Select(0, 0);
            comboBox7.Select(0, 0);
            //comboBox8.Select(0, 0);
            comboBox9.Select(0, 0);
            comboBox10.Select(0, 0);
            comboBox11.Select(0, 0);
            comboBox12.Select(0, 0);
            textBox2.Select(0, 0);

            // Disable timer
            timerRemoveBlueHighlight.Enabled = false;
        }

        private void Form1_SizeChanged(object sender, EventArgs e)
        {
            timerRemoveBlueHighlight.Enabled = true;
        }

        private void Button2_Click(object sender, EventArgs e)
        {
            if (0 == textBox1.Text.Length)
            {
                MessageBox.Show("Please enter name");
            }
            else
            {
                UpdateDB();

                tasks.RemoveAt(currentTask);
                if (0 == tasks.Count)
                {
                    MessageBox.Show("No task pending");
                    button1.Enabled = false;
                    button2.Enabled = false;
                    button3.Enabled = false;
                    button5.Enabled = false;
                }
                else
                {
                    // go for next task
                    currentTask = currentTask % tasks.Count;
                    DoTask();
                }
            }
        }

        private void Button5_Click(object sender, EventArgs e)
        {
            currentTask = ++currentTask % tasks.Count;
            DoTask();
        }

        private void DisplayResultOfTask()
        {
            currentImageCounter = 0;
            label3.Text = GetUploadTime(currentTask);
            label6.Text = tasks[currentTask].uploadedBy.id;
            label9.Text = tasks[currentTask].uploadedBy.name;
            label10.Text = tasks[currentTask].uploadedBy.email;
            textBox2.Text = ConfigurationSettings.AppSettings["backendUrl"] + "/" + tasks[currentTask].info.biodataUrl;
            pictureBox1.ImageLocation = ConfigurationSettings.AppSettings["backendUrl"] + "/" + tasks[currentTask].info.images[0];
            label12.Text = "Displaying image " + (currentImageCounter + 1) + " of " + tasks[currentTask].info.images.Count;
        }
    }
}
